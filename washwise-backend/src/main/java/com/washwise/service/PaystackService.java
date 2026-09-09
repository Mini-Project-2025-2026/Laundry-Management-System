package com.washwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.washwise.dto.PaymentInitializeRequest;
import com.washwise.entity.Booking;
import com.washwise.entity.NotificationType;
import com.washwise.entity.PaymentStatus;
import com.washwise.entity.User;
import com.washwise.exception.ResourceNotFoundException;
import com.washwise.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaystackService {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Value("${paystack.secret-key:}")
    private String secretKey;

    @Value("${paystack.callback-url:https://washwise.app/payment/callback}")
    private String callbackUrl;

    @Value("${paystack.currency:GHS}")
    private String currency;

    @Value("${paystack.mock-enabled:true}")
    private boolean mockEnabled;

    private static final RestClient PAYSTACK_CLIENT = RestClient.builder()
            .baseUrl("https://api.paystack.co")
            .build();

    public boolean isMockMode() {
        return mockEnabled && (secretKey == null || secretKey.isBlank()
                || "mock".equalsIgnoreCase(secretKey.trim())
                || "demo".equalsIgnoreCase(secretKey.trim())
                || secretKey.startsWith("mock_"));
    }

    public Map<String, Object> initialize(User customer, PaymentInitializeRequest request) {
        Booking booking = getCustomerBooking(customer, request.getBookingId());
        if (booking.getStatus() == com.washwise.entity.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled bookings cannot be paid");
        }

        String reference = "WW-" + booking.getBookingCode() + "-" + UUID.randomUUID().toString().substring(0, 8);
        String activeCurrency = (currency != null && !currency.isBlank()) ? currency : "GHS";

        BigDecimal amountToPay = request.getAmount();
        if (amountToPay == null || amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            amountToPay = booking.getTotalAmount() != null && booking.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                    ? booking.getTotalAmount()
                    : new BigDecimal("50.00");
        }

        if (Boolean.TRUE.equals(request.getMock()) || isMockMode()) {
            String mockReference = "WW-mock-" + booking.getBookingCode() + "-" + UUID.randomUUID().toString().substring(0, 8);
            booking.setPaymentReference(mockReference);
            bookingRepository.save(booking);
            return Map.of(
                    "reference", mockReference,
                    "authorizationUrl", "https://checkout.paystack.com/mock-" + mockReference,
                    "accessCode", "mock_code_" + mockReference,
                    "mock", true,
                    "currency", activeCurrency,
                    "amount", amountToPay
            );
        }

        requireConfigured();

        Map<String, Object> payload = new HashMap<>();
        payload.put("email", customer.getUsername());
        payload.put("amount", amountToPay.movePointRight(2).longValueExact());
        payload.put("reference", reference);
        payload.put("callback_url", callbackUrl);
        payload.put("currency", activeCurrency);
        payload.put("metadata", Map.of(
                "bookingId", booking.getId(),
                "bookingCode", booking.getBookingCode(),
                "customerId", customer.getId()
        ));

        try {
            JsonNode response = PAYSTACK_CLIENT.post()
                    .uri("/transaction/initialize")
                    .header("Authorization", "Bearer " + secretKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(JsonNode.class);

            if (response == null || !response.path("status").asBoolean(false)) {
                String msg = response != null && response.has("message")
                        ? response.path("message").asText()
                        : "Paystack could not initialize this payment";
                throw new IllegalStateException(msg);
            }

            booking.setPaymentReference(reference);
            bookingRepository.save(booking);
            JsonNode data = response.path("data");
            return Map.of(
                    "reference", reference,
                    "authorizationUrl", data.path("authorization_url").asText(),
                    "accessCode", data.path("access_code").asText(),
                    "mock", false,
                    "currency", activeCurrency,
                    "amount", request.getAmount()
            );
        } catch (RestClientResponseException ex) {
            throw new IllegalStateException("Paystack initialization failed: " + ex.getResponseBodyAsString());
        }
    }

    public Map<String, Object> verify(User customer, String reference) {
        Booking booking = bookingRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment reference not found"));
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You can only verify your own payment");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID
                && reference.equals(booking.getPaymentReference())) {
            return Map.of("verified", true, "reference", reference, "amount", booking.getPaidAmount(), "bookingId", booking.getId());
        }

        BigDecimal amount;
        if (isMockMode() || (reference != null && reference.contains("mock"))) {
            amount = booking.getTotalAmount() != null && booking.getTotalAmount().compareTo(BigDecimal.ZERO) > 0
                    ? booking.getTotalAmount()
                    : (booking.getPaidAmount().compareTo(BigDecimal.ZERO) > 0 ? booking.getPaidAmount() : new BigDecimal("50.00"));
        } else {
            requireConfigured();
            try {
                JsonNode response = PAYSTACK_CLIENT.get()
                        .uri("/transaction/verify/{reference}", reference)
                        .header("Authorization", "Bearer " + secretKey)
                        .retrieve()
                        .body(JsonNode.class);
                JsonNode data = response == null ? null : response.path("data");
                boolean paid = response != null
                        && response.path("status").asBoolean(false)
                        && "success".equalsIgnoreCase(data.path("status").asText());

                if (!paid) {
                    throw new IllegalStateException("Paystack has not confirmed this payment");
                }
                amount = BigDecimal.valueOf(data.path("amount").asLong()).movePointLeft(2);
            } catch (RestClientResponseException ex) {
                throw new IllegalStateException("Paystack verification failed: " + ex.getResponseBodyAsString());
            }
        }

        booking.setPaidAmount(booking.getPaidAmount().add(amount));
        booking.setPaymentStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);

        notifyPaymentSuccess(booking, amount);

        return Map.of("verified", true, "reference", reference, "amount", amount, "bookingId", booking.getId());
    }

    public Map<String, Object> processWebhook(String rawPayload, String signature) {
        if (!isMockMode()) {
            if (!isValidSignature(rawPayload, signature)) {
                throw new IllegalArgumentException("Invalid Paystack webhook signature");
            }
        }

        try {
            JsonNode root = objectMapper.readTree(rawPayload);
            String event = root.path("event").asText();
            if (!"charge.success".equalsIgnoreCase(event)) {
                return Map.of("status", "ignored", "event", event);
            }

            JsonNode data = root.path("data");
            String reference = data.path("reference").asText();
            BigDecimal amount = BigDecimal.valueOf(data.path("amount").asLong()).movePointLeft(2);

            Booking booking = bookingRepository.findByPaymentReference(reference).orElse(null);

            if (booking == null && data.has("metadata") && data.path("metadata").has("bookingId")) {
                Long bookingId = data.path("metadata").path("bookingId").asLong();
                booking = bookingRepository.findById(bookingId).orElse(null);
            }

            if (booking == null) {
                return Map.of("status", "error", "message", "Booking not found for reference " + reference);
            }

            if (booking.getPaymentStatus() != PaymentStatus.PAID) {
                booking.setPaymentReference(reference);
                booking.setPaidAmount(booking.getPaidAmount().add(amount));
                booking.setPaymentStatus(PaymentStatus.PAID);
                bookingRepository.save(booking);

                notifyPaymentSuccess(booking, amount);
            }

            return Map.of("status", "success", "reference", reference, "bookingId", booking.getId());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to process webhook: " + e.getMessage(), e);
        }
    }

    private void notifyPaymentSuccess(Booking booking, BigDecimal amount) {
        String activeCurrency = (currency != null && !currency.isBlank()) ? currency : "GHS";
        String formattedAmount = activeCurrency + " " + amount;

        notificationService.create(
                booking.getCustomer(),
                "Payment of " + formattedAmount + " confirmed for booking " + booking.getBookingCode() + ".",
                NotificationType.PAYMENT_CONFIRMED
        );

        if (booking.getLaundryBusiness() != null && booking.getLaundryBusiness().getOwner() != null) {
            notificationService.create(
                    booking.getLaundryBusiness().getOwner(),
                    "Payment received: " + formattedAmount + " for booking " + booking.getBookingCode() + " from " + booking.getCustomer().getFullName() + ".",
                    NotificationType.PAYMENT_CONFIRMED
            );
        }
    }

    private boolean isValidSignature(String payload, String signature) {
        if (secretKey == null || secretKey.isBlank() || signature == null || signature.isBlank()) {
            return false;
        }
        try {
            Mac sha512Hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            sha512Hmac.init(secretKeySpec);
            byte[] hash = sha512Hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return MessageDigest.isEqual(
                    hexString.toString().getBytes(StandardCharsets.UTF_8),
                    signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    private Booking getCustomerBooking(User customer, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You can only pay for your own booking");
        }
        return booking;
    }

    private void requireConfigured() {
        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException("Paystack is not configured. Set PAYSTACK_SECRET_KEY on the backend.");
        }
    }
}
