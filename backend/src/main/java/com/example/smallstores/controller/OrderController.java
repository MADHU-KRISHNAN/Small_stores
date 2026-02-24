package com.example.smallstores.controller;

import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<List<OrderDto>> getAllOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getAllOrdersByStore(userDetails.getStoreId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<OrderDto> getOrderById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(userDetails.getStoreId(), id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<OrderDto> createOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody OrderDto orderDto) {
        return ResponseEntity.ok(orderService.createOrder(userDetails.getStoreId(), orderDto));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        return ResponseEntity
                .ok(orderService.updateOrderStatus(userDetails.getStoreId(), id, statusUpdate.get("status")));
    }
}
