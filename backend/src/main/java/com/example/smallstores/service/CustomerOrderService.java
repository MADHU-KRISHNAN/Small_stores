package com.example.smallstores.service;

import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.dto.OrderItemDto;
import com.example.smallstores.entity.*;
import com.example.smallstores.repository.*;
import com.example.smallstores.exception.ResourceNotFoundException;
import com.example.smallstores.exception.InsufficientStockException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerOrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final CustomerUserRepository customerUserRepository;

    /**
     * Place orders from cart — groups items by store, creates one order per store
     */
    @Transactional
    public List<OrderDto> placeOrder(Long customerUserId, String shippingAddress, String notes) {
        Cart cart = cartRepository.findByCustomerUserId(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());
        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        CustomerUser customerUser = customerUserRepository.findById(customerUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Group cart items by store
        Map<Long, List<CartItem>> itemsByStore = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getStore().getId()));

        List<Order> createdOrders = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsByStore.entrySet()) {
            List<CartItem> storeItems = entry.getValue();
            Store store = storeItems.get(0).getProduct().getStore();

            // Validate stock for all items
            for (CartItem cartItem : storeItems) {
                Product product = cartItem.getProduct();
                if (product.getStock() < cartItem.getQuantity()) {
                    throw new InsufficientStockException(
                            "Insufficient stock for " + product.getName() +
                                    ": requested " + cartItem.getQuantity() + ", available " + product.getStock());
                }
            }

            // Create order
            Order order = Order.builder()
                    .orderDate(LocalDateTime.now())
                    .status(OrderStatus.PENDING)
                    .store(store)
                    .customerUser(customerUser)
                    .notes(notes)
                    .totalAmount(BigDecimal.ZERO)
                    .build();

            BigDecimal total = BigDecimal.ZERO;
            List<OrderItem> orderItems = new ArrayList<>();

            for (CartItem cartItem : storeItems) {
                Product product = cartItem.getProduct();
                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));

                OrderItem orderItem = OrderItem.builder()
                        .order(order)
                        .product(product)
                        .quantity(cartItem.getQuantity())
                        .price(product.getPrice())
                        .totalPrice(itemTotal)
                        .build();

                orderItems.add(orderItem);
                total = total.add(itemTotal);

                // Deduct stock
                product.setStock(product.getStock() - cartItem.getQuantity());
                productRepository.save(product);
            }

            order.setTotalAmount(total);
            order.setOrderItems(orderItems);
            createdOrders.add(orderRepository.save(order));
        }

        // Clear cart after placing orders
        cartItemRepository.deleteAllByCartId(cart.getId());

        return createdOrders.stream().map(this::toOrderDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<OrderDto> getOrderHistory(Long customerUserId, Pageable pageable) {
        return orderRepository.findByCustomerUserIdOrderByCreatedAtDesc(customerUserId, pageable)
                .map(this::toOrderDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderDetail(Long customerUserId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getCustomerUser() == null || !order.getCustomerUser().getId().equals(customerUserId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        return toOrderDto(order);
    }

    private OrderDto toOrderDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus().name());
        dto.setCustomerName(order.getCustomerUser() != null ? order.getCustomerUser().getName() : null);
        dto.setNotes(order.getNotes());
        if (order.getStore() != null) {
            dto.setStoreId(order.getStore().getId());
            dto.setStoreName(order.getStore().getStoreName());
        }
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());

        List<OrderItemDto> items = order.getOrderItems().stream()
                .map(item -> {
                    OrderItemDto itemDto = new OrderItemDto();
                    itemDto.setId(item.getId());
                    itemDto.setProductId(item.getProduct() != null ? item.getProduct().getId() : null);
                    itemDto.setProductName(item.getProduct() != null ? item.getProduct().getName() : null);
                    itemDto.setQuantity(item.getQuantity());
                    itemDto.setPrice(item.getPrice());
                    itemDto.setTotalPrice(item.getTotalPrice());
                    return itemDto;
                })
                .collect(Collectors.toList());

        dto.setOrderItems(items);
        return dto;
    }
}
