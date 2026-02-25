package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

        private final OrderService orderService;

        @GetMapping
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<PageResponseDTO<OrderDto>>> getAllOrders(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size) {
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                orderService.getAllOrdersByStore(userDetails.getStoreId(), pageable)));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(userDetails.getStoreId(), id)));
        }

        @PostMapping
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<OrderDto>> createOrder(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @Valid @RequestBody OrderDto orderDto) {
                return ResponseEntity
                                .ok(ApiResponse.success(orderService.createOrder(userDetails.getStoreId(), orderDto),
                                                "Order created successfully"));
        }

        @PatchMapping("/{id}/status")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @RequestBody Map<String, String> statusUpdate) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                orderService.updateOrderStatus(userDetails.getStoreId(), id,
                                                                statusUpdate.get("status")),
                                                "Order status updated successfully"));
        }
}
