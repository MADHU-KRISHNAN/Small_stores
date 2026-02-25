package com.example.smallstores.repository;

import com.example.smallstores.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByStoreId(Long storeId, Pageable pageable);

    Long countByStoreId(Long storeId);

    Long countByStoreIdAndStockLessThan(Long storeId, Integer stockThreshold);

    List<Product> findByStoreIdAndStockLessThan(Long storeId, Integer stockThreshold);
}
