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

    private String pickupType; // CUSTOMER_DROPOFF or COURIER_PICKUP

    private String returnType; // CUSTOMER_PICKUP or COURIER_DELIVERY

    private java.math.BigDecimal serviceFee;

    private java.math.BigDecimal collectionFee;

    private java.math.BigDecimal deliveryFee;

    private java.math.BigDecimal totalAmount;

    private String deliveryAddress;

    private String notes;
}
