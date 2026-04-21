package com.cj.twilio.callcenter.permission.infrastructure;

import com.cj.twilio.callcenter.permission.domain.Permission;
import com.cj.twilio.callcenter.permission_category.domain.PermissionCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByCode(String code);
    Optional<Permission> findByCode(String code);
    List<Permission> findAllByCategory(PermissionCategory category);
    boolean existsByCategory(PermissionCategory category);
}
