package com.example.smallstores.service;

import com.example.smallstores.dto.ProductDto;
import java.util.List;

public interface ProductService {
    ProductDto createProduct(Long storeId, ProductDto productDto);

    List<ProductDto> getAllProductsByStore(Long storeId);

    ProductDto getProductById(Long storeId, Long productId);

    ProductDto updateProduct(Long storeId, Long productId, ProductDto productDto);

    void deleteProduct(Long storeId, Long productId);
}
