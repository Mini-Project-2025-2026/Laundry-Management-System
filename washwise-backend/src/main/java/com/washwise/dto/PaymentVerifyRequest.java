package com.washwise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentVerifyRequest {
    @NotBlank(message = "Payment reference is required")
    private String reference;
}
