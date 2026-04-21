package com.cj.twilio.callcenter.role.application;

import com.cj.twilio.callcenter.common.exception.BusinessException;
import com.cj.twilio.callcenter.common.exception.ErrorCode;
import com.cj.twilio.callcenter.role.domain.Role;
import com.cj.twilio.callcenter.role.infrastructure.RoleRepository;
import com.cj.twilio.callcenter.role.presentation.dto.CreateRoleRequest;
import com.cj.twilio.callcenter.role.presentation.dto.UpdateRoleRequest;
import com.cj.twilio.callcenter.user.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Role getByCode(String code) {
        return roleRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public Role getById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROLE_NOT_FOUND));
    }

    @Transactional
    public Role create(CreateRoleRequest req) {
        if (roleRepository.existsByCode(req.code())) {
            throw new BusinessException(ErrorCode.ROLE_CODE_DUPLICATE);
        }
        return roleRepository.save(Role.create(req.code(), req.name(), req.description(), false));
    }

    @Transactional
    public Role update(Long id, UpdateRoleRequest req) {
        Role role = getById(id);
        if (role.isSystemRole()) {
            throw new BusinessException(ErrorCode.ROLE_SYSTEM_READONLY);
        }
        role.rename(req.name(), req.description());
        return role;
    }

    @Transactional
    public void delete(Long id) {
        Role role = getById(id);
        if (role.isSystemRole()) {
            throw new BusinessException(ErrorCode.ROLE_SYSTEM_READONLY);
        }
        if (userRepository.existsByRoleId(id)) {
            throw new BusinessException(ErrorCode.ROLE_IN_USE);
        }
        roleRepository.delete(role);
    }
}
