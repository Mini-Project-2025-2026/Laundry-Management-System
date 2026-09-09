package com.washwise.controller;

import com.washwise.dto.BookingRequest;
import com.washwise.dto.BookingStatusRequest;
import com.washwise.entity.Booking;
import com.washwise.entity.User;
import com.washwise.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@AuthenticationPrincipal User customer, @Valid @RequestBody BookingRequest request) {
        return bookingService.create(customer, request);
    }

    @GetMapping("/mine")
    public List<Booking> getMine(@AuthenticationPrincipal User customer) {
        return bookingService.getForCustomer(customer.getId());
    }

    @GetMapping("/business/{businessId}")
    public List<Booking> getForBusiness(@AuthenticationPrincipal User owner, @PathVariable Long businessId) {
        return bookingService.getForBusiness(businessId, owner);
    }

    @GetMapping("/owner/mine")
    public List<Booking> getOwnerMine(@AuthenticationPrincipal User owner) {
        return bookingService.getForOwner(owner);
    }

    @PatchMapping("/{id}/status")
    public Booking updateStatus(@AuthenticationPrincipal User owner,
                                 @PathVariable Long id,
                                 @Valid @RequestBody BookingStatusRequest request) {
        return bookingService.updateStatus(id, owner, request.getStatus());
    }
}
