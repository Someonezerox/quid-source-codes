package org.example.quid.customer.mapper;

import org.example.quid.customer.dto.CustomerProfileResponse;
import org.example.quid.customer.dto.MemorySummaryResponse;
import org.example.quid.customer.dto.PreferenceResponse;
import org.example.quid.customer.entity.ConversationSummary;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.entity.CustomerPreference;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CustomerMapper {

    public CustomerProfileResponse toProfileResponse(Customer customer, long totalConversations,
                                                     List<PreferenceResponse> preferences) {
        return new CustomerProfileResponse(
                customer.getId(),
                customer.getFirstName(),
                customer.getLastName(),
                customer.getUsername(),
                customer.getTelegramId(),
                customer.getNotes(),
                customer.getLastSeenAt(),
                totalConversations,
                preferences
        );
    }

    public PreferenceResponse toPreferenceResponse(CustomerPreference pref) {
        return new PreferenceResponse(pref.getKey(), pref.getValue(), pref.getUpdatedAt());
    }

    public MemorySummaryResponse toSummaryResponse(ConversationSummary summary) {
        return new MemorySummaryResponse(
                summary.getId(),
                summary.getConversation().getId(),
                summary.getContent(),
                summary.getCreatedAt()
        );
    }
}
