package com.example.smallstores.service;

import java.util.List;
import java.util.Map;

public interface DashboardService {
    Map<String, Object> getDashboardStats(Long storeId);

    Map<String, Object> getMonthlySales(Long storeId);

    List<Map<String, Object>> getTopSellingProducts(Long storeId, int limit);
}
