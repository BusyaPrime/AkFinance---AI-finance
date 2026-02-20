package com.akfinance.api.controller;

import com.akfinance.api.dto.dashboard.DashboardSummary;
import com.akfinance.api.security.SecurityUtils;
import com.akfinance.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityUtils securityUtils;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummary> getSummary(
            @RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(
                dashboardService.getSummary(securityUtils.getCurrentUserId(), month, year));
    }
}
