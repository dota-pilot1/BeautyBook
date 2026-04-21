package com.cj.twilio.callcenter.permission.presentation.dto;

import com.cj.twilio.callcenter.permission.domain.Permission;

public record PermissionSummary(Long id, String code, String name, String category) {
    public static PermissionSummary from(Permission p) {
        return new PermissionSummary(p.getId(), p.getCode(), p.getName(), p.getCategory());
    }
}
