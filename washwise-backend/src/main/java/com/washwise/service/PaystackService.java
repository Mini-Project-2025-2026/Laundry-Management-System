package com.washwise.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.washwise.dto.PaymentInitializeRequest;
import com.washwise.entity.Booking;
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

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PaystackService {

    private final BookingRepository bookingRepository;
    @Value("${paystack.secret-key}")
    private String secretKey;

    @Value("${paystack.callback-url}")
    private String callbackUrl;

    private static final RestClient PAYSTACK_CLIENT = RestClient.builder()
            .baseUrl("https://api.paystack.co")
            .build();

    public Map<String, Object> initialize(User customer, PaymentInitializeRequest request) {
        requireConfigured();
        Booking booking = getCustomerBooking(customer, request.getBookingId());
        if (booking.getStatus() == com.washwise.entity.BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled bookings cannot be paid");
        }

        String reference = "WW-" + booking.getBookingCode() + "-" + UUID.randomUUID().toString().substring(0, 8);
        JsonNode response = PAYSTACK_CLIENT.post()
                .uri("/transaction/initialize")
                .header("Authorization", "Bearer " + secretKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "email", customer.getUsername(),
                        "amount", request.getAmount().movePointRight(2).longValueExact(),
                        "reference", reference,
                        "callback_url", callbackUrl,
                        "metadata", Map.of("bookingId", booking.getId(), "bookingCode", booking.getBookingCode())
                ))
                .retrieve()
                .body(JsonNode.class);

        if (response == null || !response.path("status").asBoolean(false)) {
            throw new IllegalStateException("Paystack could not initialize this payment");
        }

        booking.setPaymentReference(reference);
        bookingRepository.save(booking);
        JsonNode data = response.path("data");
        return Map.of(
                "reference", reference,
                "authorizationUrl", data.path("authorization_url").asText(),
                "accessCode", data.path("access_code").asText()
        );
    }

    public Map<String, Object> verify(User customer, String reference) {
        requireConfigured();
        Booking booking = bookingRepository.findByPaymentReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment reference not found"));
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("You can only verify your own payment");
        }
        if (booking.getPaymentStatus() == PaymentStatus.PAID
                && reference.equals(booking.getPaymentReference())) {
            return Map.of("verified", true, "reference", reference, "amount", booking.getPaidAmount(), "bookingId", booking.getId());
        }

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

        BigDecimal amount = BigDecimal.valueOf(data.path("amount").asLong()).movePointLeft(2);
        booking.setPaidAmount(booking.getPaidAmount().add(amount));
        booking.setPaymentStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);
        return Map.of("verified", true, "reference", reference, "amount", amount, "bookingId", booking.getId());
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
