package com.akfinance.api.controller;

import com.akfinance.api.domain.enums.CategoryType;
import com.akfinance.api.dto.category.CategoryRequest;
import com.akfinance.api.dto.category.CategoryResponse;
import com.akfinance.api.security.SecurityUtils;
import com.akfinance.api.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) CategoryType type) {
        return ResponseEntity.ok(categoryService.getCategories(securityUtils.getCurrentUserId(), type));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(securityUtils.getCurrentUserId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(
                categoryService.updateCategory(securityUtils.getCurrentUserId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        categoryService.deleteCategory(securityUtils.getCurrentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
