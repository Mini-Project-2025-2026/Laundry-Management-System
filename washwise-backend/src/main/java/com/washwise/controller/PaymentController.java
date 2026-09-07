package com.washwise.controller;

import com.washwise.dto.PaymentRequest;
import com.washwise.entity.Payment;
import com.washwise.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders/{orderId}/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Payment recordPayment(@PathVariable Long orderId, @Valid @RequestBody PaymentRequest request) {
        return paymentService.recordPayment(orderId, request);
    }

    @GetMapping
    public List<Payment> getHistory(@PathVariable Long orderId) {
        return paymentService.getHistoryForOrder(orderId);
    }

    @GetMapping("/balance")
    public Map<String, BigDecimal> getBalance(@PathVariable Long orderId) {
        return Map.of("remainingBalance", paymentService.getRemainingBalance(orderId));
    }
}
