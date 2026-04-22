package com.cj.beautybook.user.presentation.dto;

import jakarta.validation.constraints.NotNull;

public record ChangeRoleRequest(@NotNull Long roleId) {
}
