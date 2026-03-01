package com.example.smallstores.service;

import com.example.smallstores.dto.ChangePasswordRequestDTO;
import com.example.smallstores.dto.StoreDto;
import com.example.smallstores.dto.StoreProfileResponseDTO;
import com.example.smallstores.dto.UpdateStoreProfileRequestDTO;

public interface StoreService {
    StoreDto getStore(Long id);

    StoreDto updateStore(Long id, StoreDto storeDto);

    StoreProfileResponseDTO getMyStoreProfile();

    StoreProfileResponseDTO updateStoreProfile(UpdateStoreProfileRequestDTO request);

    void changePassword(ChangePasswordRequestDTO request);
}
