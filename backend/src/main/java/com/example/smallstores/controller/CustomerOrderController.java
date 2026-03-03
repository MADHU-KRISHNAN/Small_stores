package com.example.smallstores.controller;

import com.example.smallstores.dto.*;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.CustomerOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final CustomerOrderService customerOrderService;

    @PostMapping
    public ResponseEntity<ApiResponse<List<OrderDto>>> placeOrder(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestBody(required = false) CustomerOrderRequest request) {
        String address = request != null ? request.getShippingAddress() : null;
        String notes = request != null ? request.getNotes() : null;
        return ResponseEntity.ok(ApiResponse.success(
                customerOrderService.placeOrder(user.getId(), address, notes)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getOrderHistory(
            @AuthenticationPrincipal UserDetailsImpl user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                customerOrderService.getOrderHistory(user.getId(),
                        PageRequest.of(page, size, Sort.by("createdAt").descending()))));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderDetail(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(
                customerOrderService.getOrderDetail(user.getId(), orderId)));
    }
}
