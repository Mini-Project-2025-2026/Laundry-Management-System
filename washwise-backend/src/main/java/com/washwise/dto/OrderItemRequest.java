package com.washwise.dto;

import com.washwise.entity.GarmentType;
import com.washwise.entity.ServiceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {

    @NotNull(message = "Garment type is required")
    private GarmentType garmentType;

    @NotNull(message = "Service type is required")
    private ServiceType serviceType;

    @Min(value = 1, message = "Quantity must be at least 1")
    private int quantity;
}
