package com.akfinance.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class DashboardSummary {
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private List<CategoryBreakdown> topCategories;
    private List<BudgetPreview> budgets;

    @Data
    @Builder
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryId;
        private String categoryName;
        private BigDecimal amount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    public static class BudgetPreview {
        private String categoryName;
        private BigDecimal limitAmount;
        private BigDecimal spentAmount;
        private double progressPercent;
    }
}
