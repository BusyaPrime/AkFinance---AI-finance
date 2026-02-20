package com.akfinance.api.service;

import com.akfinance.api.domain.entity.Budget;
import com.akfinance.api.domain.entity.Category;
import com.akfinance.api.domain.entity.User;
import com.akfinance.api.domain.enums.TransactionType;
import com.akfinance.api.dto.budget.BudgetRequest;
import com.akfinance.api.dto.budget.BudgetResponse;
import com.akfinance.api.dto.category.CategoryResponse;
import com.akfinance.api.exception.DuplicateResourceException;
import com.akfinance.api.exception.ResourceNotFoundException;
import com.akfinance.api.repository.BudgetRepository;
import com.akfinance.api.repository.CategoryRepository;
import com.akfinance.api.repository.TransactionRepository;
import com.akfinance.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public List<BudgetResponse> getBudgets(UUID userId, Integer month, Integer year) {
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        return budgets.stream().map(b -> toResponse(b, userId)).collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(UUID userId, BudgetRequest request) {
        if (budgetRepository.existsByUserIdAndCategoryIdAndMonthAndYear(
                userId, request.getCategoryId(), request.getMonth(), request.getYear())) {
            throw new DuplicateResourceException("Budget already exists for this category and period");
        }

        Category category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        User user = userRepository.getReferenceById(userId);

        Budget budget = Budget.builder()
                .user(user)
                .category(category)
                .month(request.getMonth())
                .year(request.getYear())
                .limitAmount(request.getLimitAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "RUB")
                .build();
        budget = budgetRepository.save(budget);
        return toResponse(budget, userId);
    }

    @Transactional
    public BudgetResponse updateBudget(UUID userId, UUID budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budget.setLimitAmount(request.getLimitAmount());
        if (request.getCurrency() != null)
            budget.setCurrency(request.getCurrency());
        budget = budgetRepository.save(budget);
        return toResponse(budget, userId);
    }

    @Transactional
    public void deleteBudget(UUID userId, UUID budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    private BudgetResponse toResponse(Budget budget, UUID userId) {
        YearMonth ym = YearMonth.of(budget.getYear(), budget.getMonth());
        Instant from = ym.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = ym.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal spent = transactionRepository.sumByCategoryAndPeriod(
                userId, budget.getCategory().getId(), from, to);
        if (spent == null)
            spent = BigDecimal.ZERO;

        double progress = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                ? spent.divide(budget.getLimitAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;

        Category c = budget.getCategory();
        CategoryResponse catResp = CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .type(c.getType())
                .icon(c.getIcon())
                .color(c.getColor())
                .build();

        return BudgetResponse.builder()
                .id(budget.getId())
                .category(catResp)
                .month(budget.getMonth())
                .year(budget.getYear())
                .limitAmount(budget.getLimitAmount())
                .spentAmount(spent)
                .currency(budget.getCurrency())
                .progressPercent(Math.min(progress, 100))
                .build();
    }
}
