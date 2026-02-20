package com.akfinance.api.repository;

import com.akfinance.api.domain.entity.UserPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface UserPreferenceRepository extends JpaRepository<UserPreference, UUID> {
}
