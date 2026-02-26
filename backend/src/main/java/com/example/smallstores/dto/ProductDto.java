package com.example.smallstores.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;

@Data
public class ProductDto {
    private Long id;
    @NotBlank
    private String name;
    @NotNull
    @Min(0)
    private BigDecimal price;
    @NotNull
    @Min(0)
    private Integer stock;
    private String category;
    private String description;
    private String sku;
}
