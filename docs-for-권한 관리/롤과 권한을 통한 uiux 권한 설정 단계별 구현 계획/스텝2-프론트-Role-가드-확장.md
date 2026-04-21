# 스텝 2: 실제 접근 제어 — 백엔드 @PreAuthorize + 프론트 RequireRole 가드

> Permission 엔티티가 준비된 상태에서 **실제 접근 차단**을 적용한다.
> 백엔드: URL/메서드 레벨 롤 검사.
> 프론트: RequireRole 가드 + 헤더 메뉴 필터링 + 미인가 페이지.

---

## 백엔드 구현

### 1. @EnableMethodSecurity 활성화

```java
// SecurityConfig.java
@EnableMethodSecurity
@Configuration
public class SecurityConfig { ... }
```

### 2. 컨트롤러별 @PreAuthorize 적용

| 컨트롤러 | 적용 범위 | 허용 롤 |
|---------|---------|--------|
| UserManagementController | 클래스 전체 | ROLE_ADMIN |
| RoleController | 클래스 전체 | ROLE_ADMIN |
| PermissionController | 클래스 전체 | ROLE_ADMIN |
| AuthController | 공개 엔드포인트 유지 | - |

```java
@PreAuthorize("hasRole('ADMIN')")
@RestController
@RequestMapping("/api/users")
public class UserManagementController { ... }
```

> `hasRole('ADMIN')` = Spring이 자동으로 `ROLE_ADMIN`과 매핑

### 3. 에러 코드

- 인증 없음 → 401 INVALID_TOKEN (기존 JwtAuthenticationFilter 처리)
- 인증됐지만 권한 없음 → 403 FORBIDDEN (기존 ErrorCode.FORBIDDEN)

---

## 프론트엔드 구현

### 1. `widgets/guards/RequireRole.tsx` — 신규

```tsx
// 사용 예시
<RequireRole roles={["ROLE_ADMIN"]}>
  <AdminPanel />
</RequireRole>
```

동작:
- `status === "loading" | "idle"` → 로딩 표시
- `user.role.code`가 roles 배열에 없으면 → `/unauthorized` redirect
- 있으면 children 렌더링

### 2. `app/unauthorized/page.tsx` — 신규

- "접근 권한이 없습니다" 메시지
- 홈으로 돌아가기 버튼

### 3. `widgets/header/ui/Header.tsx` — 수정

- 관리 드롭다운을 `ROLE_ADMIN`만 표시
- 우측 사용자 정보에 `RoleBadge` 추가

```tsx
// Before
{status === "authenticated" && <AdminDropdown />}

// After
{status === "authenticated" && user?.role.code === "ROLE_ADMIN" && <AdminDropdown />}
```

헤더 우측:
```
홍길동  [관리자]  [로그아웃]
         ↑ RoleBadge
```

### 4. `/users`, `/roles`, `/permissions` 페이지 — RequireRole 적용

```tsx
// app/users/page.tsx
<RequireRole roles={["ROLE_ADMIN"]}>
  ...
</RequireRole>
```

### 5. `shared/lib/roleUtils.ts` — 신규 (선택)

```ts
const ROLE_HIERARCHY = ["ROLE_USER", "ROLE_MANAGER", "ROLE_ADMIN"];

export function hasMinRole(userRole: string, minRole: string): boolean {
  return ROLE_HIERARCHY.indexOf(userRole) >= ROLE_HIERARCHY.indexOf(minRole);
}
```

---

## 완료 기준

- [ ] ROLE_USER 계정으로 `/users` 접근 → `/unauthorized` 이동
- [ ] ROLE_ADMIN 계정만 헤더에 "관리" 드롭다운 표시
- [ ] 헤더 우측에 username + RoleBadge 표시
- [ ] 백엔드 `POST /api/users`를 ROLE_USER 토큰으로 호출 → 403 반환
- [ ] 로그아웃 후 관리 메뉴 사라짐
