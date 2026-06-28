package org.example.quid.customer.repository;

import org.example.quid.customer.entity.Customer;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByTelegramIdAndWorkspace(Long telegramId, Workspace workspace);
    Optional<Customer> findByIdAndWorkspace(Long id, Workspace workspace);
}
