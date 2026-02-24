package com.example.smallstores.service;

import com.example.smallstores.dto.OrderDto;
import java.util.List;

public interface OrderService {
    OrderDto createOrder(Long storeId, OrderDto orderDto);

    List<OrderDto> getAllOrdersByStore(Long storeId);

    OrderDto getOrderById(Long storeId, Long orderId);

    OrderDto updateOrderStatus(Long storeId, Long orderId, String status);
}
