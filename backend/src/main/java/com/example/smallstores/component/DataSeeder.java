package com.example.smallstores.component;

import com.example.smallstores.entity.*;
import com.example.smallstores.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("dev")
public class DataSeeder implements CommandLineRunner {

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    // We only execute this once to avoid duplicate seeding
    private static final String SEEDER_USER = "admin_seeder";

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.findByUsername(SEEDER_USER).isPresent()) {
            log.info("Database already seeded. Skipping DataSeeder.");
            return;
        }

        log.info("Starting DataSeeder for Historical Analytics...");

        // Create Seeder Admin Store
        Store store = storeRepository.save(Store.builder()
                .storeName("Demo Analytics Store")
                .ownerName("System Seeder")
                .email("seeder@demo.com")
                .build());

        // Mark that seeder has run
        userRepository.save(User.builder().username(SEEDER_USER).password(passwordEncoder.encode("dummy")).store(store)
                .role(Role.STORE_OWNER).build());

        // Create dummy products
        List<Product> products = new ArrayList<>();
        Random random = new Random();
        for (int i = 1; i <= 10; i++) {
            products.add(productRepository.save(Product.builder()
                    .name("Demo Product " + i)
                    .price(BigDecimal.valueOf(10 + random.nextInt(90)))
                    .stock(100 + random.nextInt(400))
                    .store(store)
                    .build()));
        }

        // Create dummy customers
        List<Customer> customers = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            customers.add(customerRepository.save(Customer.builder()
                    .name("Demo Customer " + i)
                    .email("demo" + i + "@example.com")
                    .phone("555-010" + i)
                    .store(store)
                    .build()));
        }

        // Create 6 months of backdated orders to make dashboard chart look complete
        LocalDateTime now = LocalDateTime.now();

        for (int monthOffset = 5; monthOffset >= 0; monthOffset--) {
            int ordersThisMonth = 5 + random.nextInt(15); // Random volume per month

            for (int i = 0; i < ordersThisMonth; i++) {
                LocalDateTime orderDate = now.minusMonths(monthOffset).minusDays(random.nextInt(28));

                Order order = Order.builder()
                        .store(store)
                        .customer(customers.get(random.nextInt(customers.size())))
                        .orderDate(orderDate)
                        .status(OrderStatus.COMPLETED)
                        .orderItems(new ArrayList<>())
                        .build();

                // We must manually overwrite dates via reflection or query to bypass JPA
                // auditing
                // But simple setter might work if auditing is only on create (not strictly
                // enforced backdated)
                order.setCreatedAt(orderDate);
                order.setUpdatedAt(orderDate);

                BigDecimal orderTotal = BigDecimal.ZERO;
                int numItems = 1 + random.nextInt(4);

                for (int j = 0; j < numItems; j++) {
                    Product p = products.get(random.nextInt(products.size()));
                    int qty = 1 + random.nextInt(3);
                    BigDecimal price = p.getPrice();

                    OrderItem item = OrderItem.builder()
                            .order(order)
                            .product(p)
                            .quantity(qty)
                            .price(price)
                            .build();

                    order.getOrderItems().add(item);
                    orderTotal = orderTotal.add(price.multiply(BigDecimal.valueOf(qty)));
                }

                order.setTotalAmount(orderTotal);
                orderRepository.save(order);
            }
        }

        log.info("DataSeeder Complete!");
    }
}
