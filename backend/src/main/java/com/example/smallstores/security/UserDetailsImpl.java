package com.example.smallstores.security;

import com.example.smallstores.entity.CustomerUser;
import com.example.smallstores.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Getter
public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    @JsonIgnore
    private String password;
    private Long storeId;
    private Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String password, Long storeId,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.storeId = storeId;
        this.authorities = authorities;
    }

    /**
     * Build UserDetails from an Admin/StoreOwner User entity
     */
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
        Long userStoreId = (user.getStore() != null) ? user.getStore().getId() : null;

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                userStoreId,
                authorities);
    }

    /**
     * Build UserDetails from a CustomerUser entity
     */
    public static UserDetailsImpl build(CustomerUser customerUser) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"));

        return new UserDetailsImpl(
                customerUser.getId(),
                customerUser.getUsername(),
                customerUser.getPassword(),
                null, // customers don't belong to a store
                authorities);
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }
}
