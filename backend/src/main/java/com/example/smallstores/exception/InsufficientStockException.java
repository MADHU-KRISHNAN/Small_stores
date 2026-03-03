package com.example.smallstores.exception;

import lombok.Getter;

@Getter
public class InsufficientStockException extends RuntimeException {
    private final String productName;
    private final int available;

    public InsufficientStockException(String message) {
        super(message);
        this.productName = null;
        this.available = 0;
    }

    public InsufficientStockException(String message, String productName, int available) {
        super(message);
        this.productName = productName;
        this.available = available;
    }
}
