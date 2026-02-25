package com.example.smallstores.security;

public class StoreContextHolder {
    private static final ThreadLocal<Long> STORE_ID = new ThreadLocal<>();

    public static void setStoreId(Long storeId) {
        STORE_ID.set(storeId);
    }

    public static Long getStoreId() {
        return STORE_ID.get();
    }

    public static void clear() {
        STORE_ID.remove();
    }
}
