package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.example.smallstores.service.DashboardService;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getDashboardStats(userDetails.getStoreId())));
    }

    @GetMapping("/sales/monthly")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMonthlySales(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getMonthlySales(userDetails.getStoreId())));
    }

    @GetMapping("/products/top")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSellingProducts(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        return ResponseEntity
                .ok(ApiResponse.success(dashboardService.getTopSellingProducts(userDetails.getStoreId(), limit)));
    }
}
