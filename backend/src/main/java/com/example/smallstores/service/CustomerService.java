package com.example.smallstores.service;

import com.example.smallstores.dto.CustomerDto;
import java.util.List;

public interface CustomerService {
    CustomerDto createCustomer(Long storeId, CustomerDto customerDto);

    List<CustomerDto> getAllCustomersByStore(Long storeId);

    CustomerDto updateCustomer(Long storeId, Long customerId, CustomerDto customerDto);

    void deleteCustomer(Long storeId, Long customerId);
}
