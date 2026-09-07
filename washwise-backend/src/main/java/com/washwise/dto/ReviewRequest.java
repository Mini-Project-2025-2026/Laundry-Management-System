package com.washwise.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequest {

    @NotNull(message = "Overall rating is required")
    @Min(1) @Max(5)
    private Integer overall;

    @Min(1) @Max(5)
    private Integer cleanliness;

    @Min(1) @Max(5)
    private Integer accuracy;

    @Min(1) @Max(5)
    private Integer qualityAndTimeliness;

    @Min(1) @Max(5)
    private Integer pricingFairness;

    @Min(1) @Max(5)
    private Integer pickupDeliveryConvenience;

    private String comment;

    @NotNull(message = "A completed booking is required")
    private Long bookingId;
}
