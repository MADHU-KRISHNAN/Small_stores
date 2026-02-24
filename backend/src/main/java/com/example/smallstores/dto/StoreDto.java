package com.example.smallstores.dto;

import lombok.Data;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Data
public class StoreDto {
    private Long id;
    @NotBlank
    private String storeName;
    @NotBlank
    private String ownerName;
    @NotBlank
    @Email
    private String email;
    private String phone;
    private String address;
}
