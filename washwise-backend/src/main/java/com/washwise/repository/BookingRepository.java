package com.washwise.repository;

import com.washwise.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByLaundryBusinessIdOrderByCreatedAtDesc(Long laundryBusinessId);
    List<Booking> findByLaundryBusinessOwnerIdOrderByCreatedAtDesc(Long ownerId);
    Optional<Booking> findByBookingCode(String bookingCode);
    Optional<Booking> findByPaymentReference(String paymentReference);
    void deleteByCustomerId(Long customerId);
    void deleteByLaundryBusinessId(Long laundryBusinessId);
    void deleteByLaundryBusinessOwnerId(Long ownerId);
}
