package com.example.smallstores.service.impl;

import com.example.smallstores.dto.OrderDto;
import com.example.smallstores.dto.OrderItemDto;
import com.example.smallstores.dto.PageResponseDTO;
import com.example.smallstores.entity.*;
import com.example.smallstores.exception.InsufficientStockException;
import com.example.smallstores.exception.InvalidOrderStatusException;
import com.example.smallstores.exception.ResourceNotFoundException;
import com.example.smallstores.repository.*;
import com.example.smallstores.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    // Allowed status transitions
    private static final Map<OrderStatus, Set<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.SHIPPED, OrderStatus.CANCELLED),
            OrderStatus.SHIPPED, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.COMPLETED, Set.of(),
            OrderStatus.CANCELLED, Set.of());

    @Override
    @Transactional
    public OrderDto createOrder(Long storeId, OrderDto orderDto) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ResourceNotFoundException("Store not found"));

        Customer customer = null;
        if (orderDto.getCustomerId() != null) {
            customer = customerRepository.findById(orderDto.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
            if (!customer.getStore().getId().equals(storeId)) {
                throw new RuntimeException("Customer does not belong to this store");
            }
        }

        Order order = Order.builder()
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .store(store)
                .customer(customer)
                .totalAmount(BigDecimal.ZERO)
                .orderItems(new ArrayList<>())
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDto itemDto : orderDto.getOrderItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemDto.getProductId()));

            if (!product.getStore().getId().equals(storeId)) {
                throw new RuntimeException("Product does not belong to this store");
            }
            if (product.getStock() < itemDto.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for: " + product.getName(),
                        product.getName(),
                        product.getStock());
            }

            // Reduce stock
            product.setStock(product.getStock() - itemDto.getQuantity());
            productRepository.save(product);

            BigDecimal lineTotal = product.getPrice().multiply(new BigDecimal(itemDto.getQuantity()));

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .order(order)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice())
                    .totalPrice(lineTotal)
                    .build();

            order.getOrderItems().add(orderItem);
            totalAmount = totalAmount.add(lineTotal);
        }

        order.setTotalAmount(totalAmount);

        // Increment customer total orders
        if (customer != null) {
            customer.setTotalOrders(customer.getTotalOrders() + 1);
            customerRepository.save(customer);
        }

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
        Order order = getOrderForStore(storeId, orderId);
        return mapToDto(order);
    }

    @Override
    @Transactional
    public OrderDto updateOrderStatus(Long storeId, Long orderId, String status) {
        Order order = getOrderForStore(storeId, orderId);

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidOrderStatusException("Invalid order status: " + status);
        }

        validateStatusTransition(order.getStatus(), newStatus);

        // If cancelling, restore stock
        if (newStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        order.setStatus(newStatus);
        return mapToDto(orderRepository.save(order));
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        Set<OrderStatus> allowed = ALLOWED_TRANSITIONS.getOrDefault(current, Set.of());
        if (!allowed.contains(next)) {
            throw new InvalidOrderStatusException(
                    "Cannot transition order from " + current + " to " + next);
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private Order getOrderForStore(Long storeId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Order does not belong to this store");
        }
        return order;
    }

    private OrderDto mapToDto(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setNotes(order.getNotes());
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
            itemDto.setTotalPrice(item.getTotalPrice());
            return itemDto;
        }).collect(Collectors.toList());

        dto.setOrderItems(items);
        return dto;
    }
}
