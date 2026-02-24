package com.example.smallstores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private Long storeId;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, Long storeId, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.storeId = storeId;
        this.roles = roles;
    }
}
