package com.washwise.service;

import com.washwise.dto.OrderItemRequest;
import com.washwise.dto.OrderRequest;
import com.washwise.entity.*;
import com.washwise.exception.ResourceNotFoundException;
import com.washwise.repository.LaundryOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final LaundryOrderRepository orderRepository;
    private final CustomerService customerService;
    private final PricingService pricingService;

    /** Order statuses must progress in this sequence (CANCELLED is always allowed separately). */
    private static final List<OrderStatus> FLOW = List.of(
            OrderStatus.RECEIVED, OrderStatus.WASHING, OrderStatus.DRYING,
            OrderStatus.IRONING, OrderStatus.READY, OrderStatus.DELIVERED
    );

    public LaundryOrder createOrder(OrderRequest request) {
        Customer customer = customerService.getById(request.getCustomerId());

        LaundryOrder order = new LaundryOrder();
        order.setCustomer(customer);
        order.setOrderCode(generateOrderCode());
        order.setPickupScheduledAt(request.getPickupScheduledAt());
        order.setDeliveryScheduledAt(request.getDeliveryScheduledAt());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItemRequest itemReq : request.getItems()) {
            BigDecimal unitPrice = pricingService.getUnitPrice(itemReq.getGarmentType(), itemReq.getServiceType());
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setGarmentType(itemReq.getGarmentType());
            item.setServiceType(itemReq.getServiceType());
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(unitPrice);
            item.setSubtotal(lineTotal);
            order.getItems().add(item);

            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal discountPercent = pricingService.calculateDiscountPercent(
                request.getDiscountPercent(), customer.getLoyaltyPoints());
        BigDecimal discountAmount = pricingService.applyDiscount(subtotal, discountPercent);

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(subtotal.subtract(discountAmount));
        order.setPaymentStatus(PaymentStatus.UNPAID);

        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public LaundryOrder getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public LaundryOrder getByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with code: " + orderCode));
    }

    @Transactional(readOnly = true)
    public List<LaundryOrder> getAll() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<LaundryOrder> getByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional(readOnly = true)
    public List<LaundryOrder> getByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public LaundryOrder updateStatus(Long id, OrderStatus newStatus) {
        LaundryOrder order = getById(id);

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Cannot change status of a " + order.getStatus() + " order");
        }

        if (newStatus != OrderStatus.CANCELLED) {
            int currentIndex = FLOW.indexOf(order.getStatus());
            int newIndex = FLOW.indexOf(newStatus);
            if (newIndex < currentIndex) {
                throw new IllegalArgumentException(
                        "Cannot move order status backwards from " + order.getStatus() + " to " + newStatus);
            }
            if (newStatus == OrderStatus.DELIVERED && order.getPaymentStatus() != PaymentStatus.PAID) {
                throw new IllegalStateException("Order must be fully paid before it can be marked as DELIVERED");
            }
        }

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            int pointsEarned = order.getTotalAmount().intValue() / 10;
            customerService.addLoyaltyPoints(order.getCustomer(), pointsEarned);
        }

        return orderRepository.save(order);
    }

    private String generateOrderCode() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);
        return "ORD-" + datePart + "-" + randomPart;
    }
}
