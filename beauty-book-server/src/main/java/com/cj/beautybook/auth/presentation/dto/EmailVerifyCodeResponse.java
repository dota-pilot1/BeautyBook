package com.cj.beautybook.auth.presentation.dto;

public record EmailVerifyCodeResponse(
        String verifiedToken,
        long expiresInSec
) {}
