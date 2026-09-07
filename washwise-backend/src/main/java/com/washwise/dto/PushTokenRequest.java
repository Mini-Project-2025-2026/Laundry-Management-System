package com.washwise.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PushTokenRequest {

    @NotBlank(message = "Token is required")
    private String token;
}
