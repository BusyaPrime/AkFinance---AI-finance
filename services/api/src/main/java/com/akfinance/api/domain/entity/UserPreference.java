package com.akfinance.api.domain.entity;

import com.akfinance.api.domain.enums.Theme;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "user_preferences")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 10)
    private String locale;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Theme theme;

    @Column(name = "default_currency", nullable = false, length = 3)
    private String defaultCurrency;
}
