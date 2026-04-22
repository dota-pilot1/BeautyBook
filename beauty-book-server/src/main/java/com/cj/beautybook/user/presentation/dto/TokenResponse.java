package com.cj.beautybook.user.presentation.dto;

public record TokenResponse(
        String accessToken,
        String refreshToken,
        long accessTokenExpiresInSec,
        UserSummary user
) {}
