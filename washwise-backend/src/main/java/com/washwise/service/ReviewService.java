package com.washwise.service;

import com.washwise.dto.ReviewRequest;
import com.washwise.entity.Booking;
import com.washwise.entity.BookingStatus;
import com.washwise.entity.LaundryBusiness;
import com.washwise.entity.Review;
import com.washwise.entity.User;
import com.washwise.entity.UserRole;
import com.washwise.repository.BookingRepository;
import com.washwise.repository.LaundryBusinessRepository;
import com.washwise.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final LaundryBusinessRepository laundryBusinessRepository;
    private final LaundryBusinessService laundryBusinessService;
    private final BookingRepository bookingRepository;

    public Review submit(User customer, Long businessId, ReviewRequest request) {
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new IllegalStateException("Only customer accounts can submit reviews");
        }
        LaundryBusiness business = laundryBusinessService.getById(businessId);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getCustomer().getId().equals(customer.getId())
                || !booking.getLaundryBusiness().getId().equals(businessId)) {
            throw new IllegalStateException("You can only review your own completed booking");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("You can only review a completed booking");
        }
        if (booking.isReviewed()) {
            throw new IllegalStateException("This booking has already been reviewed");
        }

        Review review = new Review();
        review.setLaundryBusiness(business);
        review.setCustomer(customer);
        review.setOverall(request.getOverall());
        review.setCleanliness(request.getCleanliness());
        review.setAccuracy(request.getAccuracy());
        review.setQualityAndTimeliness(request.getQualityAndTimeliness());
        review.setPricingFairness(request.getPricingFairness());
        review.setPickupDeliveryConvenience(request.getPickupDeliveryConvenience());
        review.setComment(request.getComment());

        review.setBooking(booking);
        booking.setReviewed(true);
        bookingRepository.save(booking);

        Review saved = reviewRepository.save(review);

        recalculateRating(business);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Review> getForBusiness(Long businessId) {
        return reviewRepository.findByLaundryBusinessIdOrderByCreatedAtDesc(businessId);
    }

    /**
     * Recomputes the business's headline rating as a simple average of the
     * overall score across all reviews. The individual factor sub-scores
     * (cleanliness, accuracy, quality/timeliness, pricing, pickup/delivery
     * convenience) are stored per-review and available for a future
     * weighted-composite formula — kept simple for now per the "raw" build.
     */
    private void recalculateRating(LaundryBusiness business) {
        List<Review> reviews = reviewRepository.findByLaundryBusinessIdOrderByCreatedAtDesc(business.getId());
        double average = reviews.stream().mapToInt(Review::getOverall).average().orElse(0.0);
        business.setAverageRating(Math.round(average * 10.0) / 10.0);
        business.setReviewCount(reviews.size());
        laundryBusinessRepository.save(business);
    }
}
