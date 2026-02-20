package com.akfinance.api.dto.category;

import com.akfinance.api.domain.enums.CategoryType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class CategoryResponse {
    private UUID id;
    private String name;
    private CategoryType type;
    private String icon;
    private String color;
}
