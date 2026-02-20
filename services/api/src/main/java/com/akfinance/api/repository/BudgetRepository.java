package com.akfinance.api.repository;

import com.akfinance.api.domain.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserIdAndMonthAndYear(UUID userId, Integer month, Integer year);

    Optional<Budget> findByIdAndUserId(UUID id, UUID userId);

    boolean existsByUserIdAndCategoryIdAndMonthAndYear(UUID userId, UUID categoryId, Integer month, Integer year);
}
