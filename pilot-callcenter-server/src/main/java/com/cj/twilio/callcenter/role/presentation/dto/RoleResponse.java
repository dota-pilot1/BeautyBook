package com.cj.twilio.callcenter.role.presentation.dto;

import com.cj.twilio.callcenter.role.domain.Role;

public record RoleResponse(
        Long id,
        String code,
        String name,
        String description,
        boolean systemRole
) {
    public static RoleResponse from(Role r) {
        return new RoleResponse(r.getId(), r.getCode(), r.getName(), r.getDescription(), r.isSystemRole());
    }
}
