package com.washwise.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    @NotNull(message = "Customer id is required")
    private Long customerId;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<OrderItemRequest> items;

    /** Optional flat discount percentage, e.g. 10 for 10% */
    private BigDecimal discountPercent;

    private LocalDateTime pickupScheduledAt;

    private LocalDateTime deliveryScheduledAt;
}
