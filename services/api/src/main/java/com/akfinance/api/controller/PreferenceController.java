package com.akfinance.api.controller;

import com.akfinance.api.dto.preference.PreferenceRequest;
import com.akfinance.api.dto.preference.PreferenceResponse;
import com.akfinance.api.security.SecurityUtils;
import com.akfinance.api.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/me/preferences")
@RequiredArgsConstructor
public class PreferenceController {

    private final PreferenceService preferenceService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<PreferenceResponse> getPreferences() {
        return ResponseEntity.ok(
                preferenceService.getPreferences(securityUtils.getCurrentUserId()));
    }

    @PutMapping
    public ResponseEntity<PreferenceResponse> updatePreferences(@RequestBody PreferenceRequest request) {
        return ResponseEntity.ok(
                preferenceService.updatePreferences(securityUtils.getCurrentUserId(), request));
    }
}
