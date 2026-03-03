package com.example.smallstores.repository;

import com.example.smallstores.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findByCustomerUserId(Long customerUserId);

    boolean existsByCustomerUserIdAndProductId(Long customerUserId, Long productId);

    void deleteByCustomerUserIdAndProductId(Long customerUserId, Long productId);
}
