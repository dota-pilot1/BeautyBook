package com.cj.beautybook.user.presentation.dto;

import com.cj.beautybook.role.presentation.dto.RoleSummary;
import com.cj.beautybook.user.domain.User;

import java.time.Instant;

public record SignupResponse(
        Long id,
        String email,
        String username,
        RoleSummary role,
        Instant createdAt
) {
    public static SignupResponse from(User u) {
        return new SignupResponse(u.getId(), u.getEmail(), u.getUsername(), RoleSummary.from(u.getRole()), u.getCreatedAt());
    }
}
