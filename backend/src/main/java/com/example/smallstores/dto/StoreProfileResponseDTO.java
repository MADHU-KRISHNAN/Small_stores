package com.example.smallstores.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreProfileResponseDTO {

    // Store identity
    private Long storeId;
    private String storeName;
    private String ownerName;
    private String email; // display only — not editable
    private String phone;
    private String address;
    private Boolean isActive;

    // Account identity
    private String username; // display only — not editable

    // Timestamps
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Live statistics (aggregated at query time)
    private Long totalProducts;
    private Long totalCustomers;
    private Long totalOrders;
}
