package com.example.smallstores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String password;

    // Store details
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
