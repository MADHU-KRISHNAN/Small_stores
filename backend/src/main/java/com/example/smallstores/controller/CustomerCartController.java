package com.example.smallstores.controller;

import com.example.smallstores.dto.*;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
public class CustomerCartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(@AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(user.getId())));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItem(
            @AuthenticationPrincipal UserDetailsImpl user,
            @Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.addItem(user.getId(), request.getProductId(), request.getQuantity())));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> updateItemQuantity(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long productId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.updateItemQuantity(user.getId(), productId, quantity)));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                cartService.removeItem(user.getId(), productId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<String>> clearCart(@AuthenticationPrincipal UserDetailsImpl user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared"));
    }
}
