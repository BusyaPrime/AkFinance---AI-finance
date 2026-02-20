package com.akfinance.api.service;

import com.akfinance.api.domain.entity.User;
import com.akfinance.api.domain.entity.UserPreference;
import com.akfinance.api.domain.enums.Theme;
import com.akfinance.api.dto.auth.AuthResponse;
import com.akfinance.api.dto.auth.LoginRequest;
import com.akfinance.api.dto.auth.RegisterRequest;
import com.akfinance.api.exception.DuplicateResourceException;
import com.akfinance.api.repository.UserPreferenceRepository;
import com.akfinance.api.repository.UserRepository;
import com.akfinance.api.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();
        user = userRepository.save(user);

        // Create default preferences
        UserPreference prefs = UserPreference.builder()
                .user(user)
                .locale("ru-RU")
                .theme(Theme.LIGHT)
                .defaultCurrency("RUB")
                .build();
        preferenceRepository.save(prefs);

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, tokenProvider.getExpirationMs() / 1000);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }

        String token = tokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, tokenProvider.getExpirationMs() / 1000);
    }
}
