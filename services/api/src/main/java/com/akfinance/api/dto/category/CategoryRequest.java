package com.akfinance.api.dto.category;

import com.akfinance.api.domain.enums.CategoryType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @NotNull
    private CategoryType type;

    private String icon;
    private String color;
}
