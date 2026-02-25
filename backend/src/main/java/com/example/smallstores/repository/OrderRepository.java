package com.example.smallstores.repository;

import com.example.smallstores.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByStoreId(Long storeId, Pageable pageable);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.store.id = :storeId AND o.status != 'CANCELLED'")
    BigDecimal sumTotalRevenueByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId AND o.createdAt >= :startDate")
    Long countOrdersByStoreIdAndDateAfter(@Param("storeId") Long storeId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') as month, SUM(o.totalAmount) as revenue " +
            "FROM Order o WHERE o.store.id = :storeId AND o.status != 'CANCELLED' " +
            "GROUP BY FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') ORDER BY month ASC")
    List<Map<String, Object>> getMonthlySalesByStoreId(@Param("storeId") Long storeId);
}
