package com.example.smallstores.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;

@Data
public class CustomerDto {
    private Long id;
    @NotBlank
    private String name;
    private String phone;
    private String email;
}
