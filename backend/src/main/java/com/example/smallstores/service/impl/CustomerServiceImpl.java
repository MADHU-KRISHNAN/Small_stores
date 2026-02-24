package com.example.smallstores.service.impl;

import com.example.smallstores.dto.CustomerDto;
import com.example.smallstores.entity.Customer;
import com.example.smallstores.entity.Store;
import com.example.smallstores.repository.CustomerRepository;
import com.example.smallstores.repository.StoreRepository;
import com.example.smallstores.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final StoreRepository storeRepository;

    @Override
    @Transactional
    public CustomerDto createCustomer(Long storeId, CustomerDto customerDto) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Customer customer = Customer.builder()
                .name(customerDto.getName())
                .phone(customerDto.getPhone())
                .email(customerDto.getEmail())
                .store(store)
                .build();

        return mapToDto(customerRepository.save(customer));
    }

    @Override
    public List<CustomerDto> getAllCustomersByStore(Long storeId) {
        return customerRepository.findByStoreId(storeId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CustomerDto updateCustomer(Long storeId, Long customerId, CustomerDto customerDto) {
        Customer customer = getCustomer(storeId, customerId);

        customer.setName(customerDto.getName());
        customer.setPhone(customerDto.getPhone());
        customer.setEmail(customerDto.getEmail());

        return mapToDto(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void deleteCustomer(Long storeId, Long customerId) {
        Customer customer = getCustomer(storeId, customerId);
        customerRepository.delete(customer);
    }

    private Customer getCustomer(Long storeId, Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        if (!customer.getStore().getId().equals(storeId)) {
            throw new RuntimeException("Customer does not belong to this store");
        }
        return customer;
    }

    private CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setPhone(customer.getPhone());
        dto.setEmail(customer.getEmail());
        return dto;
    }
}
