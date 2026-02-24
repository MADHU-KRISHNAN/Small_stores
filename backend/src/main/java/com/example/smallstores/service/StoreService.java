package com.example.smallstores.service;

import com.example.smallstores.dto.StoreDto;

public interface StoreService {
    StoreDto getStore(Long id);

    StoreDto updateStore(Long id, StoreDto storeDto);
}
