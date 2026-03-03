package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.WishlistDto;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/wishlist")
@RequiredArgsConstructor
public class CustomerWishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistDto>>> getWishlist(
            @AuthenticationPrincipal UserDetailsImpl user) {
        return ResponseEntity.ok(ApiResponse.success(wishlistService.getWishlist(user.getId())));
    }

    @PostMapping("/{productId}")
    public ResponseEntity<ApiResponse<WishlistDto>> addToWishlist(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(
                wishlistService.addToWishlist(user.getId(), productId)));
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @AuthenticationPrincipal UserDetailsImpl user,
            @PathVariable Long productId) {
        wishlistService.removeFromWishlist(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist"));
    }
}
