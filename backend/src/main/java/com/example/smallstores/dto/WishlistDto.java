package com.example.smallstores.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private String category;
    private String storeName;
    private boolean available;
    private LocalDateTime addedAt;
}
