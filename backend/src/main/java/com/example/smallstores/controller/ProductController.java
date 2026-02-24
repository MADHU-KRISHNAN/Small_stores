package com.example.smallstores.controller;

import com.example.smallstores.dto.ProductDto;
import com.example.smallstores.security.UserDetailsImpl;
import com.example.smallstores.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<List<ProductDto>> getAllProducts(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(productService.getAllProductsByStore(userDetails.getStoreId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ProductDto> getProductById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(userDetails.getStoreId(), id));
    }

    @PostMapping
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ProductDto> createProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(productService.createProduct(userDetails.getStoreId(), productDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<ProductDto> updateProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ProductDto productDto) {
        return ResponseEntity.ok(productService.updateProduct(userDetails.getStoreId(), id, productDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STORE_OWNER')")
    public ResponseEntity<Void> deleteProduct(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long id) {
        productService.deleteProduct(userDetails.getStoreId(), id);
        return ResponseEntity.ok().build();
    }
}
