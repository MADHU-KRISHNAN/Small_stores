package com.example.smallstores.service.impl;

import com.example.smallstores.repository.CustomerRepository;
import com.example.smallstores.repository.OrderRepository;
import com.example.smallstores.repository.ProductRepository;
import com.example.smallstores.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;

    @Override
    public Map<String, Object> getDashboardStats(Long storeId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        Long totalProducts = productRepository.countByStoreId(storeId);
        Long totalCustomers = customerRepository.countByStoreId(storeId);

        BigDecimal totalRevenue = orderRepository.sumTotalRevenueByStoreId(storeId);
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        Long newOrders = orderRepository.countOrdersByStoreIdAndDateAfter(storeId, thirtyDaysAgo);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalProducts", totalProducts);
        stats.put("totalCustomers", totalCustomers);
        stats.put("newOrders", newOrders);

        return stats;
    }

    @Override
    public Map<String, Object> getMonthlySales(Long storeId) {
        List<Map<String, Object>> salesData = orderRepository.getMonthlySalesByStoreId(storeId);

        Map<String, Object> response = new HashMap<>();
        response.put("data", salesData);

        return response;
    }
}
