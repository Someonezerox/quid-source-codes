package org.example.quid.customer.repository;

import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.entity.CustomerPreference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerPreferenceRepository extends JpaRepository<CustomerPreference, Long> {
    List<CustomerPreference> findAllByCustomer(Customer customer);
    Optional<CustomerPreference> findByCustomerAndKey(Customer customer, String key);
}
