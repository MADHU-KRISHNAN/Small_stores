package com.example.smallstores.security;

import com.example.smallstores.entity.CustomerUser;
import com.example.smallstores.entity.User;
import com.example.smallstores.repository.CustomerUserRepository;
import com.example.smallstores.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final CustomerUserRepository customerUserRepository;

    /**
     * Loads user by username. Checks admin users first, then customer users.
     * This is used by the AuthTokenFilter after JWT validation.
     */
    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try admin/store-owner user first
        Optional<User> adminUser = userRepository.findByUsername(username);
        if (adminUser.isPresent()) {
            return UserDetailsImpl.build(adminUser.get());
        }

        // Try customer user
        Optional<CustomerUser> customerUser = customerUserRepository.findByUsername(username);
        if (customerUser.isPresent()) {
            return UserDetailsImpl.build(customerUser.get());
        }

        throw new UsernameNotFoundException("User Not Found with username: " + username);
    }

    /**
     * Load specifically an admin/store-owner by username
     */
    @Transactional
    public UserDetails loadAdminByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Admin Not Found with username: " + username));
        return UserDetailsImpl.build(user);
    }

    /**
     * Load specifically a customer user by username
     */
    @Transactional
    public UserDetails loadCustomerByUsername(String username) throws UsernameNotFoundException {
        CustomerUser customerUser = customerUserRepository.findByUsername(username)
                .orElseThrow(
                        () -> new UsernameNotFoundException("Customer Not Found with username: " + username));
        return UserDetailsImpl.build(customerUser);
    }
}
