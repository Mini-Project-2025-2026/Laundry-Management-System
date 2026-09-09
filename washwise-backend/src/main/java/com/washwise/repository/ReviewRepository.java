package com.washwise.repository;

import com.washwise.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByLaundryBusinessIdOrderByCreatedAtDesc(Long laundryBusinessId);
    void deleteByCustomerId(Long customerId);
    void deleteByLaundryBusinessId(Long laundryBusinessId);
    void deleteByLaundryBusinessOwnerId(Long ownerId);
}
