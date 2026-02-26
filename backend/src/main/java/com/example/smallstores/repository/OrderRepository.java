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

    // Count by status
    @Query("SELECT COUNT(o) FROM Order o WHERE o.store.id = :storeId AND o.status = :status")
    Long countByStoreIdAndStatus(@Param("storeId") Long storeId,
            @Param("status") com.example.smallstores.entity.OrderStatus status);

    // Recent orders
    Page<Order> findByStoreIdOrderByCreatedAtDesc(Long storeId, Pageable pageable);

    // Top selling products by revenue
    @Query("SELECT oi.product.name as productName, SUM(oi.quantity) as totalSold, SUM(oi.totalPrice) as totalRevenue " +
            "FROM OrderItem oi WHERE oi.order.store.id = :storeId AND oi.order.status != 'CANCELLED' " +
            "GROUP BY oi.product.id, oi.product.name " +
            "ORDER BY SUM(oi.totalPrice) DESC")
    List<Map<String, Object>> findTopSellingProducts(@Param("storeId") Long storeId, Pageable pageable);
}
