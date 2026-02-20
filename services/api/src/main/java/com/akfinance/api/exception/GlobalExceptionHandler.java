package com.akfinance.api.exception;

import com.akfinance.api.dto.common.ErrorResponse;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        List<ErrorResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorResponse.FieldError(e.getField(), e.getCode(), e.getDefaultMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(400)
                        .error("VALIDATION_ERROR")
                        .message("Validation failed")
                        .details(details)
                        .requestId(MDC.get("requestId"))
                        .build());
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponse> handleBindException(BindException ex) {
        List<ErrorResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> new ErrorResponse.FieldError(e.getField(), e.getCode(), e.getDefaultMessage()))
                .collect(Collectors.toList());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(400)
                        .error("VALIDATION_ERROR")
                        .message("Validation failed")
                        .details(details)
                        .requestId(MDC.get("requestId"))
                        .build());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(404)
                        .error("NOT_FOUND")
                        .message(ex.getMessage())
                        .requestId(MDC.get("requestId"))
                        .build());
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(409)
                        .error("DUPLICATE")
                        .message(ex.getMessage())
                        .requestId(MDC.get("requestId"))
                        .build());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(401)
                        .error("UNAUTHORIZED")
                        .message("Invalid email or password")
                        .requestId(MDC.get("requestId"))
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .timestamp(Instant.now())
                        .status(500)
                        .error("INTERNAL_ERROR")
                        .message("An unexpected error occurred")
                        .requestId(MDC.get("requestId"))
                        .build());
    }
}
