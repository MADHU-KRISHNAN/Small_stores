package com.example.smallstores.controller;

import com.example.smallstores.dto.*;
import com.example.smallstores.service.CustomerAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/customer")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MessageResponse>> register(
            @Valid @RequestBody CustomerRegisterRequest request) {
        return ResponseEntity.ok(
                ApiResponse.success(customerAuthService.register(request), "Customer registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerAuthService.login(request)));
    }
}
