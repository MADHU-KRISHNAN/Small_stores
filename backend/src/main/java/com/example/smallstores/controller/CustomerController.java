package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.CustomerDto;
import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

        private final CustomerService customerService;

        @GetMapping
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<PageResponseDTO<CustomerDto>>> getAllCustomers(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size) {
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);
                return ResponseEntity
                                .ok(ApiResponse.success(customerService.getAllCustomersByStore(userDetails.getStoreId(),
                                                pageable)));
        }

        @PostMapping
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @Valid @RequestBody CustomerDto customerDto) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                customerService.createCustomer(userDetails.getStoreId(), customerDto),
                                                "Customer created successfully"));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<CustomerDto>> updateCustomer(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody CustomerDto customerDto) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                customerService.updateCustomer(userDetails.getStoreId(), id,
                                                                customerDto),
                                                "Customer updated successfully"));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<Void>> deleteCustomer(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                customerService.deleteCustomer(userDetails.getStoreId(), id);
                return ResponseEntity.ok(ApiResponse.success(null, "Customer deleted successfully"));
        }
}
