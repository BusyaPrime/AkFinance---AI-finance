package com.akfinance.api.service;

import com.akfinance.api.domain.entity.Budget;
import com.akfinance.api.domain.enums.TransactionType;
import com.akfinance.api.dto.dashboard.DashboardSummary;
import com.akfinance.api.repository.BudgetRepository;
import com.akfinance.api.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;

    public DashboardSummary getSummary(UUID userId, int month, int year) {
        YearMonth ym = YearMonth.of(year, month);
        Instant from = ym.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = ym.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        BigDecimal income = transactionRepository.sumByTypeAndPeriod(userId, TransactionType.INCOME, from, to);
        BigDecimal expense = transactionRepository.sumByTypeAndPeriod(userId, TransactionType.EXPENSE, from, to);
        BigDecimal balance = income.subtract(expense);

        List<Object[]> categoryTotals = transactionRepository.sumByCategoryAndPeriod(
                userId, TransactionType.EXPENSE, from, to);

        List<DashboardSummary.CategoryBreakdown> topCategories = categoryTotals.stream()
                .limit(5)
                .map(row -> DashboardSummary.CategoryBreakdown.builder()
                        .categoryId(row[0].toString())
                        .categoryName((String) row[1])
                        .amount((BigDecimal) row[2])
                        .build())
                .collect(Collectors.toList());

        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        List<DashboardSummary.BudgetPreview> budgetPreviews = budgets.stream()
                .limit(3)
                .map(b -> {
                    BigDecimal spent = transactionRepository.sumByCategoryAndPeriod(
                            userId, b.getCategory().getId(), from, to);
                    if (spent == null)
                        spent = BigDecimal.ZERO;
                    double progress = b.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                            ? spent.divide(b.getLimitAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                            : 0;
                    return DashboardSummary.BudgetPreview.builder()
                            .categoryName(b.getCategory().getName())
                            .limitAmount(b.getLimitAmount())
                            .spentAmount(spent)
                            .progressPercent(Math.min(progress, 100))
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardSummary.builder()
                .totalIncome(income)
                .totalExpense(expense)
                .balance(balance)
                .topCategories(topCategories)
                .budgets(budgetPreviews)
                .build();
    }
}
