package com.akfinance.api.service;

import com.akfinance.api.domain.entity.Category;
import com.akfinance.api.domain.entity.User;
import com.akfinance.api.domain.enums.CategoryType;
import com.akfinance.api.dto.category.CategoryRequest;
import com.akfinance.api.dto.category.CategoryResponse;
import com.akfinance.api.exception.DuplicateResourceException;
import com.akfinance.api.exception.ResourceNotFoundException;
import com.akfinance.api.repository.CategoryRepository;
import com.akfinance.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public List<CategoryResponse> getCategories(UUID userId, CategoryType type) {
        List<Category> categories = (type != null)
                ? categoryRepository.findByUserIdAndType(userId, type)
                : categoryRepository.findByUserId(userId);
        return categories.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(UUID userId, CategoryRequest request) {
        if (categoryRepository.existsByUserIdAndTypeAndName(userId, request.getType(), request.getName())) {
            throw new DuplicateResourceException("Category already exists with this name and type");
        }

        User user = userRepository.getReferenceById(userId);
        Category cat = Category.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .build();
        cat = categoryRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID userId, UUID categoryId, CategoryRequest request) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        cat.setName(request.getName());
        cat.setType(request.getType());
        cat.setIcon(request.getIcon());
        cat.setColor(request.getColor());
        cat = categoryRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional
    public void deleteCategory(UUID userId, UUID categoryId) {
        Category cat = categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        categoryRepository.delete(cat);
    }

    public CategoryResponse toResponse(Category cat) {
        return CategoryResponse.builder()
                .id(cat.getId())
                .name(cat.getName())
                .type(cat.getType())
                .icon(cat.getIcon())
                .color(cat.getColor())
                .build();
    }
}
