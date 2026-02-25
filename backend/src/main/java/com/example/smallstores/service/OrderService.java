package com.example.smallstores.service;

import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderDto createOrder(Long storeId, OrderDto orderDto);

    PageResponseDTO<OrderDto> getAllOrdersByStore(Long storeId, Pageable pageable);

    OrderDto getOrderById(Long storeId, Long orderId);

    OrderDto updateOrderStatus(Long storeId, Long orderId, String status);
}
