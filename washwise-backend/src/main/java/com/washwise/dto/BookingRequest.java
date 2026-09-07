package com.washwise.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BookingRequest {

    @NotNull(message = "Laundry business is required")
    private Long laundryBusinessId;

    private boolean deliveryRequested;

    private String notes;
}
