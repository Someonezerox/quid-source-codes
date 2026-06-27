package org.example.quid.user.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.exception.ConflictException;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.user.dto.StaffInviteRequest;
import org.example.quid.user.dto.StaffInviteResponse;
import org.example.quid.user.dto.StaffResponse;
import org.example.quid.user.entity.User;
import org.example.quid.user.enums.Role;
import org.example.quid.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class StaffService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public StaffInviteResponse invite(StaffInviteRequest request, User admin) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        String tempPassword = generatePassword();

        User staff = new User();
        staff.setEmail(request.email());
        staff.setFullName(request.fullName());
        staff.setPassword(passwordEncoder.encode(tempPassword));
        staff.setRole(Role.AGENT);
        staff.setWorkspace(admin.getWorkspace());
        userRepository.save(staff);

        return new StaffInviteResponse(staff.getId(), staff.getEmail(), staff.getFullName(), tempPassword);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> list(User admin) {
        return userRepository.findAllByWorkspace(admin.getWorkspace()).stream()
                .map(u -> new StaffResponse(u.getId(), u.getEmail(), u.getFullName(), u.getRole(), u.isEnabled()))
                .toList();
    }

    public void deactivate(Long id, User admin) {
        if (admin.getId().equals(id)) {
            throw new IllegalArgumentException("Cannot deactivate your own account");
        }
        User staff = userRepository.findByIdAndWorkspace(id, admin.getWorkspace())
                .orElseThrow(() -> new ResourceNotFoundException("Staff member not found"));
        staff.setEnabled(false);
    }

    private String generatePassword() {
        return RANDOM.ints(12, 0, CHARS.length())
                .mapToObj(i -> String.valueOf(CHARS.charAt(i)))
                .collect(Collectors.joining());
    }
}
