package org.example.quid.auth.service;

import lombok.RequiredArgsConstructor;
import org.example.quid.auth.dto.AuthResponse;
import org.example.quid.auth.dto.LoginRequest;
import org.example.quid.auth.dto.MeResponse;
import org.example.quid.auth.dto.RegisterRequest;
import org.example.quid.auth.entity.RefreshToken;
import org.example.quid.auth.repository.RefreshTokenRepository;
import org.example.quid.security.JwtProperties;
import org.example.quid.security.JwtService;
import org.example.quid.user.enums.Role;
import org.example.quid.user.entity.User;
import org.example.quid.exception.ConflictException;
import org.example.quid.exception.ResourceNotFoundException;
import org.example.quid.user.repository.UserRepository;
import org.example.quid.workspace.entity.Workspace;
import org.example.quid.workspace.repository.WorkspaceRepository;
import org.jspecify.annotations.NullMarked;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@NullMarked
public class AuthService {

    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProperties jwtProperties;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already registered");
        }

        Workspace workspace = new Workspace();
        workspace.setName(request.fullName() + "'s Workspace");
        workspaceRepository.save(workspace);

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(Role.ADMIN);
        user.setWorkspace(workspace);
        userRepository.save(user);

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email()).orElseThrow();
        // revoke all active refresh tokens on new login (single-session policy)
        refreshTokenRepository.revokeAllByUser(user);

        return issueTokens(user);
    }

    public AuthResponse refresh(String rawToken) {
        RefreshToken stored = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(() -> new ResourceNotFoundException("Refresh token not found"));

        if (stored.isRevoked() || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Refresh token expired or revoked");
        }

        // rotate: revoke old token, issue new pair
        stored.setRevoked(true);
        return issueTokens(stored.getUser());
    }

    public void logout(String rawToken) {
        refreshTokenRepository.findByToken(rawToken).ifPresent(t -> t.setRevoked(true));
    }

    @Transactional(readOnly = true)
    public MeResponse me(User user) {
        Workspace ws = user.getWorkspace();
        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                ws.getId(),
                ws.getName());
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtService.generateAccessToken(user);

        RefreshToken rt = new RefreshToken();
        rt.setToken(UUID.randomUUID().toString());
        rt.setUser(user);
        rt.setExpiresAt(Instant.now().plusMillis(jwtProperties.getRefreshTokenExpiry()));
        refreshTokenRepository.save(rt);

        return new AuthResponse(accessToken, rt.getToken(), "Bearer",
                jwtProperties.getAccessTokenExpiry() / 1000);
    }
}
