package com.washwise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "laundry_businesses")
@Getter
@Setter
public class LaundryBusiness {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "authorities", "enabled", "accountNonExpired",
            "accountNonLocked", "credentialsNonExpired", "username"})
    private User owner;

    @Column(nullable = false)
    private String businessName;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String address;

    private Double latitude;

    private Double longitude;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "laundry_business_working_days", joinColumns = @JoinColumn(name = "business_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private Set<DayOfWeek> workingDays = new HashSet<>();

    private LocalTime openTime;

    private LocalTime closeTime;

    @Column(nullable = false)
    private boolean offersDelivery = false;

    // Composite rating — computed each time a review comes in.
    // Kept as a single average for now (see Review flow); the individual
    // factors mentioned in the product brief (cleanliness, accuracy, speed,
    // pricing, pickup/delivery convenience) map to Review's sub-scores below,
    // and this field is their weighted-average summary.
    @Column(nullable = false)
    private double averageRating = 0.0;

    @Column(nullable = false)
    private int reviewCount = 0;

    @Column(nullable = false)
    private int totalBookings = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
