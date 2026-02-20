package com.akfinance.api.dto.budget;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class BudgetRequest {
    @NotNull
    private UUID categoryId;

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotNull
    @Min(2000)
    @Max(2100)
    private Integer year;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal limitAmount;

    private String currency;
}
