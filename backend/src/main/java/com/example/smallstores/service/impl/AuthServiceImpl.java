package com.example.smallstores.service.impl;

import com.example.smallstores.dto.JwtResponse;
import com.example.smallstores.dto.LoginRequest;
import com.example.smallstores.dto.MessageResponse;
import com.example.smallstores.dto.SignupRequest;
import com.example.smallstores.entity.Role;
import com.example.smallstores.entity.Store;
import com.example.smallstores.entity.User;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.repository.UserRepository;
import com.example.smallstores.security.JwtUtils;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final StoreRepository storeRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getStoreId(),
                roles);
    }

    @Override
    @Transactional
    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        Store store = Store.builder()
                .storeName(signUpRequest.getStoreName())
                .ownerName(signUpRequest.getOwnerName())
                .email(signUpRequest.getEmail())
                .phone(signUpRequest.getPhone())
                .address(signUpRequest.getAddress())
                .build();

        Store savedStore = storeRepository.save(store);

        User user = User.builder()
                .username(signUpRequest.getUsername())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(Role.STORE_OWNER)
                .store(savedStore)
                .build();

        userRepository.save(user);

        return new MessageResponse("Store owner registered successfully!");
    }
}
