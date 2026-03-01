package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreDto;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;
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

    // ── Existing endpoints (kept intact) ─────────────────────────────────────────

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

    // ── New profile endpoints ────────────────────────────────────────────────────

    /**
     * GET /api/store/profile
     * Returns the complete store profile for the currently authenticated store
     * owner.
     * Includes store details, account info, and live statistics.
     * Access: STORE_OWNER only
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreProfileResponseDTO>> getMyProfile() {
        StoreProfileResponseDTO profile = storeService.getMyStoreProfile();
        return ResponseEntity.ok(ApiResponse.success(profile, "Store profile loaded successfully"));
    }

    /**
     * PUT /api/store/profile
     * Updates editable store information fields.
     * Email and username are immutable.
     * Access: STORE_OWNER only
     */
    @PutMapping("/profile")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<StoreProfileResponseDTO>> updateMyProfile(
            @Valid @RequestBody UpdateStoreProfileRequestDTO request) {
        StoreProfileResponseDTO updated = storeService.updateStoreProfile(request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Store profile updated successfully"));
    }

    /**
     * PATCH /api/store/password
     * Changes the account password.
     * Requires current password verification before accepting the new password.
     * Access: STORE_OWNER only
     */
    @PatchMapping("/password")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequestDTO request) {
        storeService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully. Please log in again."));
    }
}
