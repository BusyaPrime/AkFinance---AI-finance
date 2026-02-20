package com.akfinance.api.service;

import com.akfinance.api.domain.entity.Category;
import com.akfinance.api.domain.entity.Transaction;
import com.akfinance.api.domain.entity.User;
import com.akfinance.api.domain.enums.TransactionType;
import com.akfinance.api.dto.category.CategoryResponse;
import com.akfinance.api.dto.transaction.TransactionRequest;
import com.akfinance.api.dto.transaction.TransactionResponse;
import com.akfinance.api.exception.ResourceNotFoundException;
import com.akfinance.api.repository.CategoryRepository;
import com.akfinance.api.repository.TransactionRepository;
import com.akfinance.api.repository.UserPreferenceRepository;
import com.akfinance.api.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final UserPreferenceRepository preferenceRepository;

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(UUID userId, Instant from, Instant to,
            TransactionType type, UUID categoryId,
            BigDecimal minAmount, BigDecimal maxAmount,
            String q, Pageable pageable) {

        // Simple path: no filters — just get by userId
        if (type == null && from == null && to == null && categoryId == null
                && minAmount == null && maxAmount == null && (q == null || q.isBlank())) {
            return transactionRepository.findByUserIdOrderByOccurredAtDesc(userId, pageable)
                    .map(this::toResponse);
        }

        // Simple path: only type filter
        if (type != null && from == null && to == null && categoryId == null
                && minAmount == null && maxAmount == null && (q == null || q.isBlank())) {
            return transactionRepository.findByUserIdAndTypeOrderByOccurredAtDesc(userId, type, pageable)
                    .map(this::toResponse);
        }

        // Complex path: use Specification
        Specification<Transaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (from != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("occurredAt"), from));
            if (to != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("occurredAt"), to));
            if (type != null)
                predicates.add(cb.equal(root.get("type"), type));
            if (categoryId != null)
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            if (minAmount != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), minAmount));
            if (maxAmount != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), maxAmount));
            if (q != null && !q.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("note")), "%" + q.toLowerCase() + "%"));
            }

            query.orderBy(cb.desc(root.get("occurredAt")));
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return transactionRepository.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID userId, UUID transactionId) {
        Transaction tx = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return toResponse(tx);
    }

    @Transactional
    public TransactionResponse createTransaction(UUID userId, TransactionRequest request) {
        User user = userRepository.getReferenceById(userId);

        String currency = request.getCurrency();
        if (currency == null) {
            currency = preferenceRepository.findById(userId)
                    .map(p -> p.getDefaultCurrency())
                    .orElse("RUB");
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        Transaction tx = Transaction.builder()
                .user(user)
                .type(request.getType())
                .amount(request.getAmount())
                .currency(currency)
                .occurredAt(request.getOccurredAt())
                .category(category)
                .note(request.getNote())
                .build();
        tx = transactionRepository.save(tx);
        return toResponse(tx);
    }

    @Transactional
    public TransactionResponse updateTransaction(UUID userId, UUID transactionId, TransactionRequest request) {
        Transaction tx = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        tx.setType(request.getType());
        tx.setAmount(request.getAmount());
        if (request.getCurrency() != null)
            tx.setCurrency(request.getCurrency());
        tx.setOccurredAt(request.getOccurredAt());
        tx.setCategory(category);
        tx.setNote(request.getNote());
        tx = transactionRepository.save(tx);
        return toResponse(tx);
    }

    @Transactional
    public void deleteTransaction(UUID userId, UUID transactionId) {
        Transaction tx = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(tx);
    }

    private TransactionResponse toResponse(Transaction tx) {
        CategoryResponse catResp = null;
        if (tx.getCategory() != null) {
            Category c = tx.getCategory();
            catResp = CategoryResponse.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .type(c.getType())
                    .icon(c.getIcon())
                    .color(c.getColor())
                    .build();
        }

        return TransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .currency(tx.getCurrency())
                .occurredAt(tx.getOccurredAt())
                .category(catResp)
                .note(tx.getNote())
                .createdAt(tx.getCreatedAt())
                .updatedAt(tx.getUpdatedAt())
                .build();
    }
}
