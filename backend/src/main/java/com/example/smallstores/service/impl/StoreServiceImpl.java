package com.example.smallstores.service.impl;

import com.example.smallstores.dto.StoreDto;
import com.example.smallstores.entity.Store;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StoreServiceImpl implements StoreService {

    private final StoreRepository storeRepository;

    @Override
    public StoreDto getStore(Long id) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        return mapToDto(store);
    }

    @Override
    @Transactional
    public StoreDto updateStore(Long id, StoreDto storeDto) {
        Store store = storeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        store.setStoreName(storeDto.getStoreName());
        store.setOwnerName(storeDto.getOwnerName());
        store.setEmail(storeDto.getEmail());
        store.setPhone(storeDto.getPhone());
        store.setAddress(storeDto.getAddress());

        Store updatedStore = storeRepository.save(store);
        return mapToDto(updatedStore);
    }

    private StoreDto mapToDto(Store store) {
        StoreDto dto = new StoreDto();
        dto.setId(store.getId());
        dto.setStoreName(store.getStoreName());
        dto.setOwnerName(store.getOwnerName());
        dto.setEmail(store.getEmail());
        dto.setPhone(store.getPhone());
        dto.setAddress(store.getAddress());
        return dto;
    }
}
