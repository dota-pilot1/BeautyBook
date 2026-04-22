package com.cj.beautybook.common.response;

import com.cj.beautybook.common.exception.ErrorCode;

import java.time.Instant;
import java.util.Map;

public record ErrorResponse(
        String code,
        String message,
        Instant timestamp,
        Map<String, String> fieldErrors
) {
    public static ErrorResponse of(ErrorCode ec) {
        return new ErrorResponse(ec.getCode(), ec.getMessage(), Instant.now(), null);
    }

    public static ErrorResponse of(ErrorCode ec, Map<String, String> fieldErrors) {
        return new ErrorResponse(ec.getCode(), ec.getMessage(), Instant.now(), fieldErrors);
    }
}
