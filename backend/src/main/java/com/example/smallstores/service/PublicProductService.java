package com.example.smallstores.service;

import com.example.smallstores.dto.PublicProductDto;
import com.example.smallstores.entity.Product;
import com.example.smallstores.repository.ProductRepository;
import com.example.smallstores.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<PublicProductDto> getAllActiveProducts(String search, String category, Pageable pageable) {
        Page<Product> products;

        if (search != null && !search.isBlank() && category != null && !category.isBlank()) {
            products = productRepository.searchActiveByCategory(category, search, pageable);
        } else if (search != null && !search.isBlank()) {
            products = productRepository.searchActiveProducts(search, pageable);
        } else if (category != null && !category.isBlank()) {
            products = productRepository.findActiveByCategoryEquals(category, pageable);
        } else {
            products = productRepository.findByIsActiveTrue(pageable);
        }

        return products.map(this::toPublicDto);
    }

    @Transactional(readOnly = true)
    public PublicProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product not found");
        }

        return toPublicDto(product);
    }

    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return productRepository.findDistinctActiveCategories();
    }

    private PublicProductDto toPublicDto(Product product) {
        return new PublicProductDto(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getStock(),
                product.getCategory(),
                product.getStore() != null ? product.getStore().getStoreName() : null,
                product.getStore() != null ? product.getStore().getId() : null,
                product.getStock() != null && product.getStock() > 0);
    }
}
