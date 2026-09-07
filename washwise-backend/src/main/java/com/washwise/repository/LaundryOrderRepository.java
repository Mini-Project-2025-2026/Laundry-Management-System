package com.washwise.repository;

import com.washwise.entity.LaundryOrder;
import com.washwise.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LaundryOrderRepository extends JpaRepository<LaundryOrder, Long> {

    Optional<LaundryOrder> findByOrderCode(String orderCode);

    List<LaundryOrder> findByCustomerId(Long customerId);

    List<LaundryOrder> findByStatus(OrderStatus status);
}
