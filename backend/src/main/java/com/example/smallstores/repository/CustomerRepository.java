package com.example.smallstores.repository;

import com.example.smallstores.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Page<Customer> findByStoreId(Long storeId, Pageable pageable);

    Long countByStoreId(Long storeId);
}
