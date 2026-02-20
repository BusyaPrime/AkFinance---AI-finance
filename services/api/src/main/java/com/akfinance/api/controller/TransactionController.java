package com.akfinance.api.controller;

import com.akfinance.api.domain.enums.TransactionType;
import com.akfinance.api.dto.transaction.TransactionRequest;
import com.akfinance.api.dto.transaction.TransactionResponse;
import com.akfinance.api.security.SecurityUtils;
import com.akfinance.api.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(transactionService.getTransactions(
                securityUtils.getCurrentUserId(), from, to, type, categoryId,
                minAmount, maxAmount, q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable UUID id) {
        return ResponseEntity.ok(
                transactionService.getTransaction(securityUtils.getCurrentUserId(), id));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(securityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable UUID id, @Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(
                transactionService.updateTransaction(securityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable UUID id) {
        transactionService.deleteTransaction(securityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
