package com.washwise.repository;

import com.washwise.entity.LaundryBusiness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LaundryBusinessRepository extends JpaRepository<LaundryBusiness, Long> {

    List<LaundryBusiness> findByOwnerId(Long ownerId);

    @Query("SELECT b FROM LaundryBusiness b WHERE " +
           "LOWER(b.businessName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.address) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<LaundryBusiness> search(@Param("keyword") String keyword);

    void deleteByOwnerId(Long ownerId);
}
