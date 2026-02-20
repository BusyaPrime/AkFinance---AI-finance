package com.akfinance.api.dto.preference;

import com.akfinance.api.domain.enums.Theme;
import lombok.Data;

@Data
public class PreferenceRequest {
    private String locale;
    private Theme theme;
    private String defaultCurrency;
}
