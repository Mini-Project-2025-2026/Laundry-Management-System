package com.washwise.controller;

import com.washwise.dto.OrderRequest;
import com.washwise.dto.OrderStatusRequest;
import com.washwise.entity.LaundryOrder;
import com.washwise.entity.OrderStatus;
import com.washwise.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LaundryOrder createOrder(@Valid @RequestBody OrderRequest request) {
        return orderService.createOrder(request);
    }

    @GetMapping
    public List<LaundryOrder> getAll(@RequestParam(required = false) Long customerId,
                                      @RequestParam(required = false) OrderStatus status) {
        if (customerId != null) {
            return orderService.getByCustomer(customerId);
        }
        if (status != null) {
            return orderService.getByStatus(status);
        }
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public LaundryOrder getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @GetMapping("/code/{orderCode}")
    public LaundryOrder getByOrderCode(@PathVariable String orderCode) {
        return orderService.getByOrderCode(orderCode);
    }

    @PatchMapping("/{id}/status")
    public LaundryOrder updateStatus(@PathVariable Long id, @Valid @RequestBody OrderStatusRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }
}
