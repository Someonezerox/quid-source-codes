package org.example.quid.customer.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.conversation.repository.ConversationRepository;
import org.example.quid.customer.dto.CustomerNotesRequest;
import org.example.quid.customer.dto.CustomerProfileResponse;
import org.example.quid.customer.dto.MemorySummaryResponse;
import org.example.quid.customer.dto.PreferenceResponse;
import org.example.quid.customer.entity.Customer;
import org.example.quid.customer.entity.CustomerPreference;
import org.example.quid.customer.mapper.CustomerMapper;
import org.example.quid.customer.repository.ConversationSummaryRepository;
import org.example.quid.customer.repository.CustomerPreferenceRepository;
import org.example.quid.customer.repository.CustomerRepository;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.workspace.entity.Workspace;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerProfileService {

    private final CustomerRepository customerRepository;
    private final ConversationSummaryRepository summaryRepository;
    private final CustomerPreferenceRepository preferenceRepository;
    private final ConversationRepository conversationRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public CustomerProfileResponse get(Long id, Workspace workspace) {
        Customer customer = getOrThrow(id, workspace);
        return toProfile(customer);
    }

    @Transactional(readOnly = true)
    public List<MemorySummaryResponse> getSummaries(Long id, Workspace workspace) {
        return summaryRepository.findAllByCustomerOrderByCreatedAtDesc(getOrThrow(id, workspace))
                .stream().map(customerMapper::toSummaryResponse).toList();
    }

    public CustomerProfileResponse updateNotes(Long id, String notes, Workspace workspace) {
        Customer customer = getOrThrow(id, workspace);
        customer.setNotes(notes);
        return toProfile(customer);
    }

    @Transactional(readOnly = true)
    public List<PreferenceResponse> getPreferences(Long id, Workspace workspace) {
        return preferenceRepository.findAllByCustomer(getOrThrow(id, workspace))
                .stream().map(customerMapper::toPreferenceResponse).toList();
    }

    public PreferenceResponse setPreference(Long id, String key, String value, Workspace workspace) {
        Customer customer = getOrThrow(id, workspace);
        CustomerPreference pref = preferenceRepository.findByCustomerAndKey(customer, key)
                .orElseGet(() -> {
                    CustomerPreference p = new CustomerPreference();
                    p.setCustomer(customer);
                    p.setKey(key);
                    return p;
                });
        pref.setValue(value);
        return customerMapper.toPreferenceResponse(preferenceRepository.save(pref));
    }

    private CustomerProfileResponse toProfile(Customer customer) {
        List<PreferenceResponse> prefs = preferenceRepository.findAllByCustomer(customer)
                .stream().map(customerMapper::toPreferenceResponse).toList();
        long total = conversationRepository.countByCustomer(customer);
        return customerMapper.toProfileResponse(customer, total, prefs);
    }

    private Customer getOrThrow(Long id, Workspace workspace) {
        return customerRepository.findByIdAndWorkspace(id, workspace)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
    }
}
