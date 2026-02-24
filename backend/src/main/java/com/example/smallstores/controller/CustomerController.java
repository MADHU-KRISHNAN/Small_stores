package com.example.smallstores.controller;

import com.example.smallstores.dto.CustomerDto;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<List<CustomerDto>> getAllCustomers(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(customerService.getAllCustomersByStore(userDetails.getStoreId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<CustomerDto> createCustomer(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody CustomerDto customerDto) {
        return ResponseEntity.ok(customerService.createCustomer(userDetails.getStoreId(), customerDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<CustomerDto> updateCustomer(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody CustomerDto customerDto) {
        return ResponseEntity.ok(customerService.updateCustomer(userDetails.getStoreId(), id, customerDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<Void> deleteCustomer(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        customerService.deleteCustomer(userDetails.getStoreId(), id);
        return ResponseEntity.ok().build();
    }
}
