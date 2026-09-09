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
        LaundryBusiness business = laundryBusinessService.getById(request.getLaundryBusinessId());
        boolean isCourierPickup = "COURIER_PICKUP".equalsIgnoreCase(request.getPickupType());
        boolean isCourierDelivery = "COURIER_DELIVERY".equalsIgnoreCase(request.getReturnType());
        boolean requiresDelivery = request.isDeliveryRequested() || isCourierPickup || isCourierDelivery;

        if (requiresDelivery && !business.isOffersDelivery()) {
            throw new IllegalArgumentException("This business does not offer delivery or courier pickup");
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setLaundryBusiness(business);
        booking.setDeliveryRequested(requiresDelivery);
        booking.setPickupType(request.getPickupType() != null ? request.getPickupType() : (request.isDeliveryRequested() ? "COURIER_PICKUP" : "CUSTOMER_DROPOFF"));
        booking.setReturnType(request.getReturnType() != null ? request.getReturnType() : (request.isDeliveryRequested() ? "COURIER_DELIVERY" : "CUSTOMER_PICKUP"));

        java.math.BigDecimal sFee = request.getServiceFee() != null ? request.getServiceFee() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal cFee = request.getCollectionFee() != null ? request.getCollectionFee() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal dFee = request.getDeliveryFee() != null ? request.getDeliveryFee() : java.math.BigDecimal.ZERO;
        java.math.BigDecimal total = request.getTotalAmount() != null ? request.getTotalAmount() : sFee.add(cFee).add(dFee);

        booking.setServiceFee(sFee);
        booking.setCollectionFee(cFee);
        booking.setDeliveryFee(dFee);
        booking.setTotalAmount(total);
        booking.setDeliveryAddress(request.getDeliveryAddress());
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

    @Transactional(readOnly = true)
    public List<Booking> getForOwner(User owner) {
        if (owner.getRole() != UserRole.LAUNDRY_OWNER) {
            throw new IllegalStateException("Only laundry owners can view their business bookings");
        }
        return bookingRepository.findByLaundryBusinessOwnerIdOrderByCreatedAtDesc(owner.getId());
    }

    private static final String CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

    private String generateBookingCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            int idx = ThreadLocalRandom.current().nextInt(CODE_ALPHABET.length());
            sb.append(CODE_ALPHABET.charAt(idx));
        }
        return "BK-" + datePart + "-" + sb;
    }
}
