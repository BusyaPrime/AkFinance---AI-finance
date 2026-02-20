package com.akfinance.api.repository;

import com.akfinance.api.domain.entity.Transaction;
import com.akfinance.api.domain.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUserId(UUID id, UUID userId);

    Page<Transaction> findByUserIdOrderByOccurredAtDesc(UUID userId, Pageable pageable);

    Page<Transaction> findByUserIdAndTypeOrderByOccurredAtDesc(UUID userId, TransactionType type, Pageable pageable);

    @Query("""
                SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
                WHERE t.user.id = :userId
                AND t.type = :type
                AND t.occurredAt >= :from
                AND t.occurredAt < :to
            """)
    BigDecimal sumByTypeAndPeriod(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
                SELECT t.category.id, t.category.name, SUM(t.amount)
                FROM Transaction t
                WHERE t.user.id = :userId
                AND t.type = :type
                AND t.occurredAt >= :from
                AND t.occurredAt < :to
                AND t.category IS NOT NULL
                GROUP BY t.category.id, t.category.name
                ORDER BY SUM(t.amount) DESC
            """)
    List<Object[]> sumByCategoryAndPeriod(
            @Param("userId") UUID userId,
            @Param("type") TransactionType type,
            @Param("from") Instant from,
            @Param("to") Instant to);

    @Query("""
                SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t
                WHERE t.user.id = :userId
                AND t.type = 'EXPENSE'
                AND t.category.id = :categoryId
                AND t.occurredAt >= :from
                AND t.occurredAt < :to
            """)
    BigDecimal sumByCategoryAndPeriod(
            @Param("userId") UUID userId,
            @Param("categoryId") UUID categoryId,
            @Param("from") Instant from,
            @Param("to") Instant to);

    long countByUserId(UUID userId);
}
