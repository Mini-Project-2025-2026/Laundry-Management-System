package com.washwise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "laundry_business_id", nullable = false)
    @JsonIgnoreProperties({"owner"})
    private LaundryBusiness laundryBusiness;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "authorities", "enabled", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "username"})
    private User customer;

    // Optional — links this review to the specific booking it came from, so
    // that booking can be marked as "reviewed" and not prompted again.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    @JsonIgnoreProperties({"customer", "laundryBusiness"})
    private Booking booking;

    // Overall star rating, plus the individual factors called out in the brief.
    // averageRating on LaundryBusiness is recomputed from `overall` across all reviews;
    // the sub-scores are stored so a future weighted-formula can use them.
    @Min(1) @Max(5)
    @Column(nullable = false)
    private int overall;

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

    @Column(length = 1000)
    private String comment;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
