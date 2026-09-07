package com.washwise.controller;

import com.washwise.dto.PaymentInitializeRequest;
import com.washwise.dto.PaymentVerifyRequest;
import com.washwise.entity.User;
import com.washwise.service.PaystackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/paystack")
@RequiredArgsConstructor
public class PaystackController {

    private final PaystackService paystackService;

    @PostMapping("/initialize")
    public Map<String, Object> initialize(@AuthenticationPrincipal User customer,
                                          @Valid @RequestBody PaymentInitializeRequest request) {
        return paystackService.initialize(customer, request);
    }

    @PostMapping("/verify")
    public Map<String, Object> verify(@AuthenticationPrincipal User customer,
                                      @Valid @RequestBody PaymentVerifyRequest request) {
        return paystackService.verify(customer, request.getReference());
    }
}