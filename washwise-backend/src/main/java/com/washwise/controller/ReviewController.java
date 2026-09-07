package com.washwise.controller;

import com.washwise.dto.ReviewRequest;
import com.washwise.entity.Review;
import com.washwise.entity.User;
import com.washwise.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laundry-businesses/{businessId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<Review> getForBusiness(@PathVariable Long businessId) {
        return reviewService.getForBusiness(businessId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Review submit(@AuthenticationPrincipal User customer,
                          @PathVariable Long businessId,
                          @Valid @RequestBody ReviewRequest request) {
        return reviewService.submit(customer, businessId, request);
    }
}
