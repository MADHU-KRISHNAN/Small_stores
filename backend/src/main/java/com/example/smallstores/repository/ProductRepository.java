package com.example.smallstores.repository;

import com.example.smallstores.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
        Page<Product> findByStoreId(Long storeId, Pageable pageable);

        Long countByStoreId(Long storeId);

        Long countByStoreIdAndIsActiveTrue(Long storeId);

        Long countByStoreIdAndStockLessThan(Long storeId, Integer stockThreshold);

        List<Product> findByStoreIdAndStockLessThan(Long storeId, Integer stockThreshold);

        // Search by name or category
        @Query("SELECT p FROM Product p WHERE p.store.id = :storeId " +
                        "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(p.category) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Product> searchByStoreId(@Param("storeId") Long storeId,
                        @Param("search") String search,
                        Pageable pageable);

        // Filter by category
        Page<Product> findByStoreIdAndCategory(Long storeId, String category, Pageable pageable);

        // Search + category filter
        @Query("SELECT p FROM Product p WHERE p.store.id = :storeId AND p.category = :category " +
                        "AND (LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')))")
        Page<Product> searchByStoreIdAndCategory(@Param("storeId") Long storeId,
                        @Param("category") String category,
                        @Param("search") String search,
                        Pageable pageable);

        // Distinct categories for a store
        @Query("SELECT DISTINCT p.category FROM Product p WHERE p.store.id = :storeId AND p.category IS NOT NULL")
        List<String> findDistinctCategoriesByStoreId(@Param("storeId") Long storeId);

        // Count out-of-stock products
        Long countByStoreIdAndStock(Long storeId, Integer stock);
}
