package com.cj.twilio.callcenter.role.presentation;

import com.cj.twilio.callcenter.role.application.RoleService;
import com.cj.twilio.callcenter.role.presentation.dto.CreateRoleRequest;
import com.cj.twilio.callcenter.role.presentation.dto.RoleResponse;
import com.cj.twilio.callcenter.role.presentation.dto.UpdateRoleRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Role", description = "롤(역할) CRUD")
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @Operation(summary = "전체 롤 목록 조회")
    public List<RoleResponse> list() {
        return roleService.findAll().stream().map(RoleResponse::from).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "롤 상세 조회")
    public RoleResponse get(@PathVariable Long id) {
        return RoleResponse.from(roleService.getById(id));
    }

    @PostMapping
    @Operation(summary = "롤 등록")
    public ResponseEntity<RoleResponse> create(@Valid @RequestBody CreateRoleRequest req) {
        RoleResponse created = RoleResponse.from(roleService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "롤 수정 (시스템 롤은 불가)")
    public RoleResponse update(@PathVariable Long id, @Valid @RequestBody UpdateRoleRequest req) {
        return RoleResponse.from(roleService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "롤 삭제 (시스템 롤 및 사용 중 롤은 불가)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
