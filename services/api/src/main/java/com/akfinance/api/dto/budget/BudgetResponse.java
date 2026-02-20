package com.akfinance.api.dto.budget;

import com.akfinance.api.dto.category.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class BudgetResponse {
    private UUID id;
    private CategoryResponse category;
    private Integer month;
    private Integer year;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private String currency;
    private double progressPercent;
}
