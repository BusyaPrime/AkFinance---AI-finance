package com.akfinance.api.controller;

import com.akfinance.api.dto.budget.BudgetRequest;
import com.akfinance.api.dto.budget.BudgetResponse;
import com.akfinance.api.security.SecurityUtils;
import com.akfinance.api.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam Integer month, @RequestParam Integer year) {
        return ResponseEntity.ok(
                budgetService.getBudgets(securityUtils.getCurrentUserId(), month, year));
    }

    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(@Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(securityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable UUID id, @Valid @RequestBody BudgetRequest request) {
        return ResponseEntity.ok(
                budgetService.updateBudget(securityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(@PathVariable UUID id) {
        budgetService.deleteBudget(securityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
