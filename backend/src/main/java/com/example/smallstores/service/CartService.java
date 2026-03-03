package com.example.smallstores.service;

import com.example.smallstores.dto.CartDto;
import com.example.smallstores.dto.CartItemDto;
import com.example.smallstores.entity.*;
import com.example.smallstores.repository.*;
import com.example.smallstores.exception.ResourceNotFoundException;
import com.example.smallstores.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CustomerUserRepository customerUserRepository;

    @Transactional(readOnly = true)
    public CartDto getCart(Long customerUserId) {
        Cart cart = getOrCreateCart(customerUserId);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto addItem(Long customerUserId, Long productId, int quantity) {
        Cart cart = getOrCreateCart(customerUserId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (!product.getIsActive()) {
            throw new ResourceNotFoundException("Product is not available");
        }
        if (product.getStock() < quantity) {
            throw new InsufficientStockException("Only " + product.getStock() + " items available");
        }

        // Check if item already in cart
        var existingItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQty = item.getQuantity() + quantity;
            if (product.getStock() < newQty) {
                throw new InsufficientStockException("Only " + product.getStock() + " items available");
            }
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(quantity)
                    .build();
            cartItemRepository.save(newItem);
        }

        // Reload cart to get fresh data
        cart = cartRepository.findByCustomerUserId(customerUserId).orElse(cart);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto updateItemQuantity(Long customerUserId, Long productId, int quantity) {
        Cart cart = cartRepository.findByCustomerUserId(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            Product product = item.getProduct();
            if (product.getStock() < quantity) {
                throw new InsufficientStockException("Only " + product.getStock() + " items available");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        cart = cartRepository.findByCustomerUserId(customerUserId).orElse(cart);
        return toCartDto(cart);
    }

    @Transactional
    public CartDto removeItem(Long customerUserId, Long productId) {
        Cart cart = cartRepository.findByCustomerUserId(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);

        cart = cartRepository.findByCustomerUserId(customerUserId).orElse(cart);
        return toCartDto(cart);
    }

    @Transactional
    public void clearCart(Long customerUserId) {
        Cart cart = cartRepository.findByCustomerUserId(customerUserId).orElse(null);
        if (cart != null) {
            cartItemRepository.deleteAllByCartId(cart.getId());
        }
    }

    private Cart getOrCreateCart(Long customerUserId) {
        return cartRepository.findByCustomerUserId(customerUserId)
                .orElseGet(() -> {
                    CustomerUser customerUser = customerUserRepository.findById(customerUserId)
                            .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
                    Cart newCart = Cart.builder()
                            .customerUser(customerUser)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    private CartDto toCartDto(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        List<CartItemDto> itemDtos = items.stream()
                .map(item -> new CartItemDto(
                        item.getProduct().getId(),
                        item.getProduct().getName(),
                        item.getProduct().getPrice(),
                        item.getQuantity(),
                        item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())),
                        item.getProduct().getStore() != null ? item.getProduct().getStore().getStoreName() : null,
                        item.getProduct().getStock()))
                .collect(Collectors.toList());

        BigDecimal total = itemDtos.stream()
                .map(CartItemDto::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalItems = itemDtos.stream().mapToInt(CartItemDto::getQuantity).sum();

        return new CartDto(cart.getId(), itemDtos, total, totalItems);
    }
}
