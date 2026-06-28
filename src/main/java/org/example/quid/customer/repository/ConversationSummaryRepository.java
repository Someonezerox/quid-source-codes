package org.example.quid.customer.repository;

import org.example.quid.customer.entity.ConversationSummary;
import org.example.quid.customer.entity.Customer;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversationSummaryRepository extends JpaRepository<ConversationSummary, Long> {
    List<ConversationSummary> findByCustomerOrderByCreatedAtDesc(Customer customer, Pageable pageable);
    List<ConversationSummary> findAllByCustomerOrderByCreatedAtDesc(Customer customer);
}
