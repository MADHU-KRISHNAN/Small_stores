package com.example.smallstores.service.impl;

import com.example.smallstores.dto.AuthResponse;
import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.MessageResponse;
import com.example.smallstores.dto.RegisterRequest;
import com.example.smallstores.entity.Role;
import com.example.smallstores.entity.Store;
import com.example.smallstores.entity.User;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.repository.UserRepository;
import com.example.smallstores.security.JwtUtils;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.AuthService;
import com.example.smallstores.exception.UserAlreadyExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private final AuthenticationManager authenticationManager;
        private final UserRepository userRepository;
        private final StoreRepository storeRepository;
        private final PasswordEncoder encoder;
        private final JwtUtils jwtUtils;

        @Override
        public AuthResponse authenticateUser(LoginRequest loginRequest) {
                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),
                                                loginRequest.getPassword()));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                String jwt = jwtUtils.generateJwtToken(authentication);

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                // Fetch store name for the response
                String storeName = "";
                String role = "";
                if (userDetails.getStoreId() != null) {
                        storeName = storeRepository.findById(userDetails.getStoreId())
                                        .map(Store::getStoreName)
                                        .orElse("");
                }
                if (!userDetails.getAuthorities().isEmpty()) {
                        role = userDetails.getAuthorities().iterator().next().getAuthority()
                                        .replace("ROLE_", "");
                }

                return new AuthResponse(jwt,
                                userDetails.getId(),
                                userDetails.getUsername(),
                                userDetails.getStoreId(),
                                storeName,
                                role);
        }

        @Override
        @Transactional
        public MessageResponse registerUser(RegisterRequest registerRequest) {
                if (userRepository.findByUsername(registerRequest.getUsername()).isPresent()) {
                        throw new UserAlreadyExistsException("Error: Username is already taken!");
                }

                Store store = Store.builder()
                                .storeName(registerRequest.getStoreName())
                                .ownerName(registerRequest.getOwnerName())
                                .email(registerRequest.getEmail())
                                .phone(registerRequest.getPhone())
                                .address(registerRequest.getAddress())
                                .build();

                Store savedStore = storeRepository.save(store);

                User user = User.builder()
                                .username(registerRequest.getUsername())
                                .password(encoder.encode(registerRequest.getPassword()))
                                .role(Role.STORE_OWNER)
                                .store(savedStore)
                                .build();

                userRepository.save(user);

                return new MessageResponse("Store owner registered successfully!");
        }
}
