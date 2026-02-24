package com.example.smallstores.service;

import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.SignupRequest;
import com.example.smallstores.dto.JwtResponse;
import com.example.smallstores.dto.MessageResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);

    MessageResponse registerUser(SignupRequest signUpRequest);
}
