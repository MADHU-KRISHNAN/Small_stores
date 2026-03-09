package com.example.smallstores.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDto {
    private Long id;
    private LocalDateTime orderDate;
    private BigDecimal totalAmount;
    private String status;
    private Long customerId;
    private String customerName;
    private Long storeId;
    private String storeName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDto> orderItems;
}
