package com.example.smallstores.service.impl;

import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreDto;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;
import com.example.smallstores.entity.Store;
import com.example.smallstores.entity.User;
import com.example.smallstores.exception.BusinessValidationException;
import com.example.smallstores.exception.ResourceNotFoundException;
import com.example.smallstores.exception.UnauthorizedAccessException;
import com.example.smallstores.repository.CustomerRepository;
import com.example.smallstores.repository.OrderRepository;
import com.example.smallstores.repository.ProductRepository;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.repository.UserRepository;
import com.example.smallstores.security.StoreContextHolder;
import com.example.smallstores.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Existing methods (kept intact) ───────────────────────────────────────────

    @Override
    public StoreDto getStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));
        return mapToDto(store);
    }

    @Override
    @Transactional
    public StoreDto updateStore(Long id, StoreDto storeDto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        store.setStoreName(storeDto.getStoreName());
        store.setOwnerName(storeDto.getOwnerName());
        store.setEmail(storeDto.getEmail());
        store.setPhone(storeDto.getPhone());
        store.setAddress(storeDto.getAddress());

        Store updatedStore = storeRepository.save(store);
        return mapToDto(updatedStore);
    }

    private StoreDto mapToDto(Store store) {
        StoreDto dto = new StoreDto();
        dto.setId(store.getId());
        dto.setStoreName(store.getStoreName());
        dto.setOwnerName(store.getOwnerName());
        dto.setEmail(store.getEmail());
        dto.setPhone(store.getPhone());
        dto.setAddress(store.getAddress());
        return dto;
    }

    // ── New profile methods ──────────────────────────────────────────────────────

    @Override
    public StoreProfileResponseDTO getMyStoreProfile() {
        Long storeId = StoreContextHolder.getStoreId();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found for id: " + storeId));

        User user = getCurrentUser();

        // Aggregate live statistics in a single pass
        Long totalProducts = productRepository.countByStoreIdAndIsActiveTrue(storeId);
        Long totalCustomers = customerRepository.countByStoreId(storeId);
        Long totalOrders = orderRepository.countByStoreId(storeId);

        return StoreProfileResponseDTO.builder()
                .storeId(store.getId())
                .storeName(store.getStoreName())
                .ownerName(store.getOwnerName())
                .email(store.getEmail())
                .phone(store.getPhone())
                .address(store.getAddress())
                .isActive(store.getIsActive())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .username(user.getUsername())
                .totalProducts(totalProducts != null ? totalProducts : 0L)
                .totalCustomers(totalCustomers != null ? totalCustomers : 0L)
                .totalOrders(totalOrders != null ? totalOrders : 0L)
                .build();
    }

    @Override
    @Transactional
    public StoreProfileResponseDTO updateStoreProfile(UpdateStoreProfileRequestDTO request) {
        Long storeId = StoreContextHolder.getStoreId();

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found for id: " + storeId));

        // Apply only the editable fields — email is immutable, never touch it
        store.setStoreName(request.getStoreName().trim());
        store.setOwnerName(request.getOwnerName().trim());

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            store.setPhone(request.getPhone().trim());
        }

        if (request.getAddress() != null) {
            store.setAddress(request.getAddress().trim());
        }

        storeRepository.save(store);

        // Return the updated full profile
        return getMyStoreProfile();
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequestDTO request) {
        // Validate confirm password matches before touching the database
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BusinessValidationException("New password and confirm password do not match");
        }

        // Reject if new password is the same as current password
        User user = getCurrentUser();
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BusinessValidationException("New password must be different from current password");
        }

        // Verify current password is correct before allowing change
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedAccessException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // Private helper — resolves the User entity for the currently authenticated
    // principal
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }
}
