package com.example.smallstores.controller;

import com.example.smallstores.dto.ApiResponse;
import com.example.smallstores.dto.PublicProductDto;
import com.example.smallstores.service.PublicProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicProductController {

    private final PublicProductService publicProductService;

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<PublicProductDto>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<PublicProductDto> products = publicProductService.getAllActiveProducts(
                search, category, PageRequest.of(page, size, sort));

        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<ApiResponse<PublicProductDto>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(publicProductService.getProductById(id)));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.success(publicProductService.getAllCategories()));
    }
}
