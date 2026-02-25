package com.example.smallstores.service.impl;

import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.dto.ProductDto;
import com.example.smallstores.entity.Product;
import com.example.smallstores.entity.Store;
import com.example.smallstores.repository.ProductRepository;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public ProductDto createProduct(Long storeId, ProductDto productDto) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Product product = Product.builder()
                .name(productDto.getName())
                .price(productDto.getPrice())
                .stock(productDto.getStock())
                .category(productDto.getCategory())
                .store(store)
                .build();

        Product savedProduct = productRepository.save(product);
        return mapToDto(savedProduct);
    }

    @Override
    public PageResponseDTO<ProductDto> getAllProductsByStore(Long storeId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByStoreId(storeId, pageable);
        List<ProductDto> content = productPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PageResponseDTO.<ProductDto>builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .build();
    }

    @Override
    public ProductDto getProductById(Long storeId, Long productId) {
        Product product = getProduct(storeId, productId);
        return mapToDto(product);
    }

    @Override
    @Transactional
    public ProductDto updateProduct(Long storeId, Long productId, ProductDto productDto) {
        Product product = getProduct(storeId, productId);

        product.setName(productDto.getName());
        product.setPrice(productDto.getPrice());
        product.setStock(productDto.getStock());
        product.setCategory(productDto.getCategory());

        return mapToDto(productRepository.save(product));
    }

    @Override
    @Transactional
    public void deleteProduct(Long storeId, Long productId) {
        Product product = getProduct(storeId, productId);
        productRepository.delete(product);
    }

    @Override
    public List<ProductDto> getLowStockProducts(Long storeId, Integer threshold) {
        return productRepository.findByStoreIdAndStockLessThan(storeId, threshold).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private Product getProduct(Long storeId, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        if (!product.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Product does not belong to this store");
        }
        return product;
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setCategory(product.getCategory());
        return dto;
    }
}
