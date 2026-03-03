package com.example.smallstores.security;

import com.example.smallstores.entity.CustomerUser;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.smallstores.repository.UserRepository;

@Component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    @Autowired
    private UserRepository userRepository;

    private Key key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    /**
     * Generate JWT for admin/store-owner users (from Spring Security
     * Authentication)
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        String role = userPrincipal.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .claim("storeId", userPrincipal.getStoreId())
                .claim("role", role)
                .claim("userId", userPrincipal.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Generate JWT for customer users (separate auth table)
     */
    public String generateCustomerJwtToken(CustomerUser customerUser) {
        return Jwts.builder()
                .setSubject(customerUser.getUsername())
                .claim("role", "CUSTOMER")
                .claim("userId", customerUser.getId())
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getRoleFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
        Object roleClaim = claims.get("role");
        return roleClaim != null ? roleClaim.toString() : null;
    }

    public Long getUserIdFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
        Object userIdClaim = claims.get("userId");
        return userIdClaim != null ? Long.valueOf(userIdClaim.toString()) : null;
    }

    public Long extractStoreId(String token) {
        Claims claims = Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody();
        Object storeIdClaim = claims.get("storeId");

        if (storeIdClaim != null) {
            return Long.valueOf(storeIdClaim.toString());
        }

        // For customer tokens, there is no storeId
        String role = getRoleFromJwtToken(token);
        if ("CUSTOMER".equals(role)) {
            return null;
        }

        String username = claims.getSubject();
        logger.warn("Legacy token detected for user: {}. No storeId claim. Falling back to DB lookup.", username);
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (user.getStore() != null) {
                        return user.getStore().getId();
                    }
                    return null;
                })
                .orElseThrow(() -> new RuntimeException("Cannot resolve store for this token"));
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }
}
