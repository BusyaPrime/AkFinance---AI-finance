package com.akfinance.api.service;

import com.akfinance.api.domain.entity.UserPreference;
import com.akfinance.api.domain.entity.User;
import com.akfinance.api.dto.preference.PreferenceRequest;
import com.akfinance.api.dto.preference.PreferenceResponse;
import com.akfinance.api.exception.ResourceNotFoundException;
import com.akfinance.api.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PreferenceService {

    private final UserPreferenceRepository preferenceRepository;

    public PreferenceResponse getPreferences(UUID userId) {
        UserPreference prefs = preferenceRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found"));
        return toResponse(prefs);
    }

    @Transactional
    public PreferenceResponse updatePreferences(UUID userId, PreferenceRequest request) {
        UserPreference prefs = preferenceRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User preferences not found"));

        if (request.getLocale() != null)
            prefs.setLocale(request.getLocale());
        if (request.getTheme() != null)
            prefs.setTheme(request.getTheme());
        if (request.getDefaultCurrency() != null)
            prefs.setDefaultCurrency(request.getDefaultCurrency());

        prefs = preferenceRepository.save(prefs);
        return toResponse(prefs);
    }

    private PreferenceResponse toResponse(UserPreference prefs) {
        return PreferenceResponse.builder()
                .locale(prefs.getLocale())
                .theme(prefs.getTheme())
                .defaultCurrency(prefs.getDefaultCurrency())
                .build();
    }
}
