package com.akfinance.api.dto.transaction;

import com.akfinance.api.domain.enums.TransactionType;
import com.akfinance.api.dto.category.CategoryResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class TransactionResponse {
    private UUID id;
    private TransactionType type;
    private BigDecimal amount;
    private String currency;
    private Instant occurredAt;
    private CategoryResponse category;
    private String note;
    private Instant createdAt;
    private Instant updatedAt;
}
