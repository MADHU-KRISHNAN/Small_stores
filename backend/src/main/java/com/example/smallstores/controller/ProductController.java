package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.PageResponseDTO;
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
        public ResponseEntity<ApiResponse<PageResponseDTO<ProductDto>>> getAllProducts(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "10") int size,
                        @RequestParam(name = "category", required = false) String category,
                        @RequestParam(name = "search", required = false) String search) {
                org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page,
                                size);
                return ResponseEntity
                                .ok(ApiResponse.success(productService.getAllProductsByStore(userDetails.getStoreId(),
                                                pageable, category, search)));
        }

        @GetMapping("/low-stock")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<List<ProductDto>>> getLowStockProducts(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @RequestParam(name = "threshold", defaultValue = "10") Integer threshold) {
                return ResponseEntity
                                .ok(ApiResponse.success(productService.getLowStockProducts(userDetails.getStoreId(),
                                                threshold)));
        }

        @GetMapping("/categories")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<List<String>>> getCategories(
                        @AuthenticationPrincipal UserDetailsImpl userDetails) {
                return ResponseEntity
                                .ok(ApiResponse.success(productService.getCategories(userDetails.getStoreId())));
        }

        @GetMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<ProductDto>> getProductById(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                return ResponseEntity
                                .ok(ApiResponse.success(productService.getProductById(userDetails.getStoreId(), id)));
        }

        @PostMapping
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<ProductDto>> createProduct(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @Valid @RequestBody ProductDto productDto) {
                return ResponseEntity.ok(
                                ApiResponse.success(productService.createProduct(userDetails.getStoreId(), productDto),
                                                "Product created successfully"));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id,
                        @Valid @RequestBody ProductDto productDto) {
                return ResponseEntity
                                .ok(ApiResponse.success(
                                                productService.updateProduct(userDetails.getStoreId(), id, productDto),
                                                "Product updated successfully"));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('STORE_OWNER')")
        public ResponseEntity<ApiResponse<Void>> deleteProduct(
                        @AuthenticationPrincipal UserDetailsImpl userDetails,
                        @PathVariable Long id) {
                productService.deleteProduct(userDetails.getStoreId(), id);
                return ResponseEntity.ok(ApiResponse.success(null, "Product deleted successfully"));
        }
}
