package com.washwise.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.washwise.dto.PaymentInitializeRequest;
import com.washwise.entity.*;
import com.washwise.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaystackServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private NotificationService notificationService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private PaystackService paystackService;

    private User customer;
    private LaundryBusiness business;
    private Booking booking;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paystackService, "secretKey", "mock");
        ReflectionTestUtils.setField(paystackService, "callbackUrl", "https://washwise.app/payment/callback");
        ReflectionTestUtils.setField(paystackService, "currency", "GHS");
        ReflectionTestUtils.setField(paystackService, "mockEnabled", true);

        customer = new User();
        customer.setId(1L);
        customer.setEmail("customer@test.com");
        customer.setFullName("Test Customer");

        User owner = new User();
        owner.setId(2L);
        owner.setEmail("owner@test.com");
        owner.setFullName("Test Owner");

        business = new LaundryBusiness();
        business.setId(10L);
        business.setBusinessName("Fresh Wash");
        business.setOwner(owner);

        booking = new Booking();
        booking.setId(100L);
        booking.setBookingCode("WW-TEST-100");
        booking.setCustomer(customer);
        booking.setLaundryBusiness(business);
        booking.setStatus(BookingStatus.PENDING);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        booking.setPaidAmount(BigDecimal.ZERO);
    }

    @Test
    void testInitializeInMockMode() {
        when(bookingRepository.findById(100L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        PaymentInitializeRequest req = new PaymentInitializeRequest();
        req.setBookingId(100L);
        req.setAmount(new BigDecimal("60.00"));

        Map<String, Object> result = paystackService.initialize(customer, req);

        assertNotNull(result.get("reference"));
        assertTrue(result.get("reference").toString().startsWith("WW-"));
        assertEquals(true, result.get("mock"));
        assertEquals("GHS", result.get("currency"));
        verify(bookingRepository).save(booking);
    }

    @Test
    void testVerifyInMockMode() {
        booking.setPaymentReference("WW-TEST-REF");
        when(bookingRepository.findByPaymentReference("WW-TEST-REF")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Map<String, Object> result = paystackService.verify(customer, "WW-TEST-REF");

        assertEquals(true, result.get("verified"));
        assertEquals(PaymentStatus.PAID, booking.getPaymentStatus());
        verify(notificationService, times(2)).create(any(), any(), any());
    }

    @Test
    void testProcessWebhookChargeSuccess() {
        booking.setPaymentReference("WW-WEBHOOK-REF");
        when(bookingRepository.findByPaymentReference("WW-WEBHOOK-REF")).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        String payload = "{" +
                "\"event\":\"charge.success\"," +
                "\"data\":{" +
                "  \"reference\":\"WW-WEBHOOK-REF\"," +
                "  \"amount\":5000," +
                "  \"status\":\"success\"," +
                "  \"metadata\":{\"bookingId\":100}" +
                "}}";

        Map<String, Object> result = paystackService.processWebhook(payload, "mock_signature");

        assertEquals("success", result.get("status"));
        assertEquals(PaymentStatus.PAID, booking.getPaymentStatus());
        assertEquals(new BigDecimal("50.00"), booking.getPaidAmount());
        verify(notificationService, times(2)).create(any(), any(), any());
    }
}
