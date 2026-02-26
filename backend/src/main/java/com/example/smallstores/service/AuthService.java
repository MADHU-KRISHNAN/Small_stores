package com.example.smallstores.service;

import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.RegisterRequest;
import com.example.smallstores.dto.AuthResponse;
import com.example.smallstores.dto.MessageResponse;

public interface AuthService {
    AuthResponse authenticateUser(LoginRequest loginRequest);

    MessageResponse registerUser(RegisterRequest registerRequest);
}
