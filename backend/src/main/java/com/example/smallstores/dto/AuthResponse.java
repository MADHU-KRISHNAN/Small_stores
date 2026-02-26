package com.example.smallstores.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private Long storeId;
    private String storeName;
    private String role;

    public AuthResponse(String token, Long id, String username, Long storeId, String storeName, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.storeId = storeId;
        this.storeName = storeName;
        this.role = role;
    }
}
