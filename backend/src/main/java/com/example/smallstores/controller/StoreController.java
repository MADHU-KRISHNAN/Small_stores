package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.StoreDto;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.StoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/store")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    @GetMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreDto>> getStoreDetails(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(ApiResponse.success(storeService.getStore(userDetails.getStoreId())));
    }

    @PutMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreDto>> updateStoreDetails(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody StoreDto storeDto) {
        return ResponseEntity.ok(ApiResponse.success(storeService.updateStore(userDetails.getStoreId(), storeDto),
                "Store updated successfully"));
    }
}
