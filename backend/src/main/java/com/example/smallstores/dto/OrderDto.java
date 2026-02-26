package com.example.smallstores.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.example.smallstores.entity.OrderStatus;

@Data
public class OrderDto {
    private Long id;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private Long customerId;
    private String customerName;
    private String notes;
    private List<OrderItemDto> orderItems;
}
