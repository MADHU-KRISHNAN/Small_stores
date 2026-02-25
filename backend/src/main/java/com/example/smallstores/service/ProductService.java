package com.example.smallstores.service;

import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.dto.ProductDto;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {
    ProductDto createProduct(Long storeId, ProductDto productDto);

    PageResponseDTO<ProductDto> getAllProductsByStore(Long storeId, Pageable pageable);

    ProductDto getProductById(Long storeId, Long productId);

    ProductDto updateProduct(Long storeId, Long productId, ProductDto productDto);

    void deleteProduct(Long storeId, Long productId);

    List<ProductDto> getLowStockProducts(Long storeId, Integer threshold);
}
