package com.akfinance.api.dto.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private Instant timestamp;
    private int status;
    private String error;
    private String message;
    private List<FieldError> details;
    private String requestId;

    @Data
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String code;
        private String message;
    }
}
