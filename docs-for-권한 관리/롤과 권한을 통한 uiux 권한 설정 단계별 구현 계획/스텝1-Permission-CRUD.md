# 스텝 1: Permission 엔티티 도입 + CRUD

> 롤 코드만으로는 "이 롤이 무엇을 할 수 있는지" 알 수 없다.
> **Permission 엔티티**를 도입해 권한을 테이블로 관리한다.
> 롤-권한 M:N 매핑 UI는 스텝 2에서 완성한다.

---

## 구현 현황 (2026-04-22)

| 항목 | 상태 |
|------|:----:|
| Permission 엔티티 + JPA Repository | ✅ |
| PermissionService (CRUD) | ✅ |
| PermissionController (`/api/permissions`) | ✅ |
| PermissionSeeder (기본 권한 9종 시드) | ✅ |
| 프론트 `/permissions` 페이지 + PermissionTable | ✅ |
| 프론트 PermissionFormDialog (등록/수정) | ✅ |
| 헤더 관리 드롭다운에 "권한 관리" 링크 추가 | ✅ |
| Role-Permission M:N 매핑 UI (RolePermissionDialog) | ⬜ → 스텝 2 |
| 실제 접근 제어 (`@PreAuthorize`, RequireRole) | ⬜ → 스텝 2 |

> **현재 정책**: 접근 제어는 일단 비활성. 로그인된 유저라면 누구나 관리 페이지 접근 가능.

---

## 데이터 모델

```
permissions
  id          BIGINT PK
  code        VARCHAR(80) UNIQUE  예) USER_VIEW, ROLE_EDIT
  name        VARCHAR(80)         예) "사용자 조회"
  description VARCHAR(255)
  category    VARCHAR(40)         예) USER, ROLE, PERMISSION
  created_at  TIMESTAMP
  updated_at  TIMESTAMP

role_permissions (join table — 엔티티 있음, 매핑 UI는 스텝 2)
  role_id        BIGINT FK → roles.id
  permission_id  BIGINT FK → permissions.id
  PK (role_id, permission_id)
```

---

## 기본 시드 권한 (PermissionSeeder)

| code | name | category |
|------|------|---------|
| USER_VIEW | 사용자 조회 | USER |
| USER_EDIT | 사용자 수정 | USER |
| USER_DELETE | 사용자 삭제 | USER |
| ROLE_VIEW | 롤 조회 | ROLE |
| ROLE_EDIT | 롤 수정/등록 | ROLE |
| ROLE_DELETE | 롤 삭제 | ROLE |
| PERMISSION_VIEW | 권한 조회 | PERMISSION |
| PERMISSION_EDIT | 권한 수정/등록 | PERMISSION |
| PERMISSION_DELETE | 권한 삭제 | PERMISSION |

---

## Permission API

| 메서드 | URL | 설명 | 인증 |
|--------|-----|------|------|
| GET | `/api/permissions` | 전체 목록 (category 필터) | 로그인 |
| GET | `/api/permissions/{id}` | 상세 | 로그인 |
| POST | `/api/permissions` | 등록 | 로그인 |
| PATCH | `/api/permissions/{id}` | 수정 (name, description, category) | 로그인 |
| DELETE | `/api/permissions/{id}` | 삭제 | 로그인 |

> 스텝 2에서 `ROLE_ADMIN` 전용으로 강화 예정

---

## Role-Permission API (RoleController — 이미 구현됨)

| 메서드 | URL | 설명 |
|--------|-----|------|
| GET | `/api/roles/{id}/permissions` | 롤에 할당된 권한 목록 |
| PUT | `/api/roles/{id}/permissions` | 롤 권한 일괄 교체 (permissionIds[]) |

> API는 있으나 프론트 UI(RolePermissionDialog)는 스텝 2에서 구현

---

## 에러 코드

| 코드 | 상태 | 설명 |
|------|------|------|
| PERMISSION_NOT_FOUND | 404 | |
| PERMISSION_CODE_DUPLICATE | 409 | |

---

## 다음 스텝

→ **스텝 2**: Role-Permission 매핑 UI + 실제 접근 제어
