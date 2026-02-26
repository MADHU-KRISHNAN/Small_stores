package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.AuthResponse;
import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.MessageResponse;
import com.example.smallstores.dto.RegisterRequest;
import com.example.smallstores.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.authenticateUser(loginRequest)));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<MessageResponse>> registerUser(
            @Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity
                .ok(ApiResponse.success(authService.registerUser(registerRequest), "User registered successfully"));
    }
}
