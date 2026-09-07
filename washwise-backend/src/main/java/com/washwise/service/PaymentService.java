package com.washwise.service;

import com.washwise.dto.PaymentRequest;
import com.washwise.entity.LaundryOrder;
import com.washwise.entity.Payment;
import com.washwise.entity.PaymentStatus;
import com.washwise.repository.LaundryOrderRepository;
import com.washwise.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final LaundryOrderRepository orderRepository;
    private final OrderService orderService;

    public Payment recordPayment(Long orderId, PaymentRequest request) {
        LaundryOrder order = orderService.getById(orderId);

        BigDecimal alreadyPaid = totalPaid(order);
        BigDecimal remaining = order.getTotalAmount().subtract(alreadyPaid);

        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("This order is already fully paid");
        }
        if (request.getAmount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount exceeds the remaining balance of " + remaining);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(request.getAmount());
        payment.setMethod(request.getMethod());
        Payment saved = paymentRepository.save(payment);

        BigDecimal newTotalPaid = alreadyPaid.add(request.getAmount());
        if (newTotalPaid.compareTo(order.getTotalAmount()) >= 0) {
            order.setPaymentStatus(PaymentStatus.PAID);
        } else {
            order.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        }
        orderRepository.save(order);

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Payment> getHistoryForOrder(Long orderId) {
        return paymentRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public BigDecimal totalPaid(LaundryOrder order) {
        return paymentRepository.findByOrderId(order.getId()).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public BigDecimal getRemainingBalance(Long orderId) {
        LaundryOrder order = orderService.getById(orderId);
        return order.getTotalAmount().subtract(totalPaid(order));
    }
}
