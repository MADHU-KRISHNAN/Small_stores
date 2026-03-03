package com.example.smallstores.service;

import com.example.smallstores.dto.WishlistDto;
import com.example.smallstores.entity.*;
import com.example.smallstores.repository.*;
import com.example.smallstores.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final CustomerUserRepository customerUserRepository;

    @Transactional(readOnly = true)
    public List<WishlistDto> getWishlist(Long customerUserId) {
        List<Wishlist> items = wishlistRepository.findByCustomerUserId(customerUserId);
        return items.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public WishlistDto addToWishlist(Long customerUserId, Long productId) {
        if (wishlistRepository.existsByCustomerUserIdAndProductId(customerUserId, productId)) {
            throw new RuntimeException("Product already in wishlist");
        }

        CustomerUser customerUser = customerUserRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Wishlist wishlist = Wishlist.builder()
                .customerUser(customerUser)
                .product(product)
                .build();

        return toDto(wishlistRepository.save(wishlist));
    }

    @Transactional
    public void removeFromWishlist(Long customerUserId, Long productId) {
        if (!wishlistRepository.existsByCustomerUserIdAndProductId(customerUserId, productId)) {
            throw new ResourceNotFoundException("Product not in wishlist");
        }
        wishlistRepository.deleteByCustomerUserIdAndProductId(customerUserId, productId);
    }

    private WishlistDto toDto(Wishlist wishlist) {
        Product product = wishlist.getProduct();
        return new WishlistDto(
                wishlist.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory(),
                product.getStore() != null ? product.getStore().getStoreName() : null,
                product.getStock() != null && product.getStock() > 0,
                wishlist.getAddedAt());
    }
}
