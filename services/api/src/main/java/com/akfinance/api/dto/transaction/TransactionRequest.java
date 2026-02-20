package com.akfinance.api.dto.transaction;

import com.akfinance.api.domain.enums.TransactionType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
public class TransactionRequest {
    @NotNull
    private TransactionType type;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    private String currency;

    @NotNull
    private Instant occurredAt;

    private UUID categoryId;

    @Size(max = 1000)
    private String note;
}
