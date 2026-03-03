package com.example.smallstores.service;

import com.example.smallstores.dto.*;
import com.example.smallstores.entity.CustomerUser;
import com.example.smallstores.repository.CustomerUserRepository;
import com.example.smallstores.security.JwtUtils;
import com.example.smallstores.exception.UserAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerUserRepository customerUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public MessageResponse register(CustomerRegisterRequest request) {
        if (customerUserRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username is already taken!");
        }
        if (customerUserRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered!");
        }

        CustomerUser customerUser = CustomerUser.builder()
                .name(request.getName())
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .build();

        customerUserRepository.save(customerUser);
        return new MessageResponse("Customer registered successfully!");
    }

    public AuthResponse login(LoginRequest request) {
        CustomerUser customerUser = customerUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), customerUser.getPassword())) {
            throw new RuntimeException("Invalid username or password");
        }

        if (!customerUser.getIsEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        String jwt = jwtUtils.generateCustomerJwtToken(customerUser);

        return new AuthResponse(jwt,
                customerUser.getId(),
                customerUser.getUsername(),
                null, // no storeId for customers
                null, // no storeName for customers
                "CUSTOMER");
    }
}
