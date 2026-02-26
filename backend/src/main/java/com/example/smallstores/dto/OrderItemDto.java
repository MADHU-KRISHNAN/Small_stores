package com.example.smallstores.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
public class OrderItemDto {
    private Long id;
    @NotNull
    private Long productId;
    private String productName;
    @NotNull
    @Min(1)
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;
}
