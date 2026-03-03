package com.example.smallstores.dto;

import lombok.Data;

@Data
public class CustomerOrderRequest {
    private String shippingAddress;
    private String notes;
}
