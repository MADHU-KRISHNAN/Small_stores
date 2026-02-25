package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.JwtResponse;
import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.MessageResponse;
import com.example.smallstores.dto.SignupRequest;
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

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(ApiResponse.success(authService.authenticateUser(loginRequest)));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<MessageResponse>> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return ResponseEntity
                .ok(ApiResponse.success(authService.registerUser(signUpRequest), "User registered successfully"));
    }
}
