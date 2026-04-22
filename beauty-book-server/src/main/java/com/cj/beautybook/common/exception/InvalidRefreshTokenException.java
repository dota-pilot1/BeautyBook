package com.cj.beautybook.common.exception;

public class InvalidRefreshTokenException extends BusinessException {
    public InvalidRefreshTokenException() {
        super(ErrorCode.INVALID_REFRESH_TOKEN);
    }
}
