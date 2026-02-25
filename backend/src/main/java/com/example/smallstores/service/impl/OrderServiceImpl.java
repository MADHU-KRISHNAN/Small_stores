package com.example.smallstores.service.impl;

import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.dto.OrderItemDto;
import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.entity.*;
import com.example.smallstores.repository.*;
import com.example.smallstores.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public OrderDto createOrder(Long storeId, OrderDto orderDto) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Customer customer = null;
        if (orderDto.getCustomerId() != null) {
            customer = customerRepository.findById(orderDto.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (!customer.getStore().getId().equals(storeId)) {
                throw new RuntimeException("Customer does not belong to this store");
            }
        }

        Order order = Order.builder()
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.COMPLETED) // Simplifying: auto-complete on creation
                .store(store)
                .customer(customer)
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDto itemDto : orderDto.getOrderItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemDto.getProductId()));

            if (!product.getStore().getId().equals(storeId)) {
                throw new RuntimeException("Product does not belong to this store");
            }
            if (product.getStock() < itemDto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Reduce stock
            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .order(order)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice()) // Snapshot price
                    .build();

            order.getOrderItems().add(orderItem);

            BigDecimal lineTotal = product.getPrice().multiply(new BigDecimal(itemDto.getQuantity()));
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);

        Order savedOrder = orderRepository.save(order);
        return mapToDto(savedOrder);
    }

    @Override
    public PageResponseDTO<OrderDto> getAllOrdersByStore(Long storeId, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findByStoreId(storeId, pageable);
        List<OrderDto> content = orderPage.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PageResponseDTO.<OrderDto>builder()
                .content(content)
                .pageNumber(orderPage.getNumber())
                .pageSize(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .last(orderPage.isLast())
                .build();
    }

    @Override
    public OrderDto getOrderById(Long storeId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Order does not belong to this store");
        }
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long storeId, Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        if (!order.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Order does not belong to this store");
        }

        order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        return mapToDto(orderRepository.save(order));
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        if (order.getCustomer() != null) {
            dto.setCustomerId(order.getCustomer().getId());
            dto.setCustomerName(order.getCustomer().getName());
        }

        List<OrderItemDto> items = order.getOrderItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProduct().getId());
            itemDto.setProductName(item.getProduct().getName());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setOrderItems(items);
        return dto;
    }
}
