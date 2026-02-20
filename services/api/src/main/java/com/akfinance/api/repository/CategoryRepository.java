package com.akfinance.api.repository;

import com.akfinance.api.domain.entity.Category;
import com.akfinance.api.domain.enums.CategoryType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findByUserIdAndType(UUID userId, CategoryType type);

    List<Category> findByUserId(UUID userId);

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndTypeAndName(UUID userId, CategoryType type, String name);
}
