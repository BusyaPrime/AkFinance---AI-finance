package com.akfinance.api.dto.preference;

import com.akfinance.api.domain.enums.Theme;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class PreferenceResponse {
    private String locale;
    private Theme theme;
    private String defaultCurrency;
}
