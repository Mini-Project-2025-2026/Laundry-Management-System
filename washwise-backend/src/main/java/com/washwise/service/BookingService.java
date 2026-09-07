package com.washwise.service;

import com.washwise.dto.BookingRequest;
import com.washwise.entity.*;
import com.washwise.exception.ResourceNotFoundException;
import com.washwise.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final LaundryBusinessService laundryBusinessService;
    private final NotificationService notificationService;

    private static final List<BookingStatus> FLOW = List.of(
            BookingStatus.PENDING, BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS,
            BookingStatus.READY, BookingStatus.COMPLETED
    );

    public Booking create(User customer, BookingRequest request) {
        if (customer.getRole() != UserRole.CUSTOMER) {
            throw new IllegalStateException("Only customer accounts can create bookings");
        }
        LaundryBusiness business = laundryBusinessService.getById(request.getLaundryBusinessId());
        if (request.isDeliveryRequested() && !business.isOffersDelivery()) {
            throw new IllegalArgumentException("This business does not offer delivery");
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setLaundryBusiness(business);
        booking.setDeliveryRequested(request.isDeliveryRequested());
        booking.setNotes(request.getNotes());
        booking.setBookingCode(generateBookingCode());
        Booking saved = bookingRepository.save(booking);

        laundryBusinessService.incrementBookingCount(business);

        return saved;
    }

    @Transactional(readOnly = true)
    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Booking> getForCustomer(Long customerId) {
        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getForBusiness(Long businessId, User owner) {
        LaundryBusiness business = laundryBusinessService.getById(businessId);
        if (!business.getOwner().getId().equals(owner.getId())) {
            throw new IllegalStateException("You can only view bookings for your own business");
        }
        return bookingRepository.findByLaundryBusinessIdOrderByCreatedAtDesc(businessId);
    }

    public Booking updateStatus(Long bookingId, User actingOwner, BookingStatus newStatus) {
        Booking booking = getById(bookingId);

        if (!booking.getLaundryBusiness().getOwner().getId().equals(actingOwner.getId())) {
            throw new IllegalStateException("You can only update bookings for your own business");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a " + booking.getStatus() + " booking");
        }

        if (newStatus != BookingStatus.CANCELLED) {
            int currentIndex = FLOW.indexOf(booking.getStatus());
            int newIndex = FLOW.indexOf(newStatus);
            if (newIndex < currentIndex) {
                throw new IllegalArgumentException("Cannot move booking status backwards");
            }
        }

        booking.setStatus(newStatus);
        Booking saved = bookingRepository.save(booking);

        if (newStatus == BookingStatus.COMPLETED) {
            notificationService.create(
                    booking.getCustomer(),
                    "Your order at " + booking.getLaundryBusiness().getBusinessName() + " (booking "
                            + booking.getBookingCode() + ") has been completed"
                            + (booking.isDeliveryRequested() ? " and is on its way to you." : " and is ready for pickup."),
                    NotificationType.ORDER_COMPLETED
            );
        }

        return saved;
    }

    private String generateBookingCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "BK-" + datePart + "-" + randomPart;
    }
}
