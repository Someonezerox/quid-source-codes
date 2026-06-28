package org.example.quid.customer.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.repository.CustomerRepository;
import org.example.quid.telegram.dto.TelegramUser;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Customer findOrCreate(TelegramUser from, Workspace workspace) {
        return customerRepository.findByTelegramIdAndWorkspace(from.id(), workspace)
                .map(c -> {
                    c.setLastSeenAt(Instant.now());
                    return c;
                })
                .orElseGet(() -> {
                    try {
                        Customer c = new Customer();
                        c.setTelegramId(from.id());
                        c.setFirstName(from.firstName());
                        c.setLastName(from.lastName());
                        c.setUsername(from.username());
                        c.setWorkspace(workspace);
                        c.setLastSeenAt(Instant.now());
                        return customerRepository.saveAndFlush(c);
                    } catch (DataIntegrityViolationException e) {
                        return customerRepository.findByTelegramIdAndWorkspace(from.id(), workspace).orElseThrow();
                    }
                });
    }
}
