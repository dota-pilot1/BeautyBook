# Pilot Callcenter

AWS Connect 기반 콜센터 관리 플랫폼.

이 프로젝트는 단순한 콜센터 기능 구현을 넘어, **실무 수준의 인증/인가 보일러플레이트**를 목적으로 한다.
JWT 기반 인증, Role 기반 접근 제어(RBAC), Permission 단위 API/UI 제어까지 교과서적인 구조로 구현하고 있으며,
이후 어떤 프로젝트에서도 재사용 가능한 인증/인가 기반을 만드는 것이 핵심 목표다.

---

## 보일러플레이트로서의 현재 상태 평가

### 잘 갖춰진 부분 (교과서적)

- **구조 분리** — `AuthService` / `JwtTokenProvider` / `JwtAuthenticationFilter` / `UserPrincipal` 책임 분리 명확
- **RBAC 설계** — Role ↔ Permission N:M 매핑, JWT에 permissions 포함, `hasAuthority()` 기반 체크 (업계 표준)
- **Refresh Token Rotation** — DB 저장, 재발급 시 회전
- **Stateless + JWT Filter** — `SessionCreationPolicy.STATELESS`
- **통일된 에러 응답** — `ErrorCode` + `GlobalExceptionHandler` + `AuthorizationDeniedException` 403 처리
- **팩토리 메서드 패턴** — `UserPrincipal.fromClaims()` / `fromEntity()`
- **프론트 axios 인터셉터** — 401 자동 갱신, 병렬 요청 큐잉

### 보일러플레이트로 쓰기엔 부족한 부분 (개선 필요)

| 항목 | 현재 상태 | 개선 방향 |
|------|-----------|-----------|
| Refresh Token 저장 위치 | localStorage (XSS 취약) | **httpOnly 쿠키 + CSRF 토큰** |
| Rate Limiting | 없음 | 로그인 엔드포인트에 bucket4j/Redis 적용 |
| 계정 잠금 | 없음 | 로그인 실패 N회 시 자동 잠금 |
| Password 정책 | 최소 길이만 | 복잡도(대소문자/숫자/특수문자) 검증 |
| 감사 로그 (Audit) | 없음 | 로그인/권한 변경 이력 테이블 |
| 이메일 인증 | 없음 | 가입 후 이메일 확인 플로우 |
| 비밀번호 재설정 | 없음 | 메일 링크 기반 재설정 |
| 권한 변경 즉시 반영 | 안 됨 (JWT 만료까지 유효) | Redis 블랙리스트 / 짧은 access 만료 |
| 테스트 | 없음 | `@SpringBootTest` / `@WebMvcTest` 기반 통합 테스트 |
| 프론트 권한 체크 | `usePermission` 훅 (2차 예정) | `<Permission require="..."/>` 컴포넌트 래퍼 |

### 용도별 적합성

| 용도 | 적합성 |
|------|--------|
| 학습 / 사이드 프로젝트 기반 | ✅ 충분 |
| 스타트업 MVP | ⚠️ Refresh Token 쿠키화 + Rate Limit 추가 후 |
| 엔터프라이즈 프로덕션 | ❌ 감사 로그, 이메일 인증, 계정 잠금, 테스트 필요 |

### 보일러플레이트화를 위한 우선순위 (TODO)

1. **httpOnly 쿠키 + CSRF 방어** — Refresh Token 보안 강화
2. **Rate Limiting** — 로그인 brute-force 방어
3. **통합 테스트 세트** — 인증/인가 flow regression 방지

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot 3, Spring Security 6, JWT (jjwt), JPA (Hibernate) |
| Frontend | Next.js 15 (App Router), React 19, TanStack Query, TanStack Store |
| DB | PostgreSQL 15 |
| 스타일 | Tailwind CSS v4, shadcn/ui (new-york) |
| 인프라 | Docker Compose, AWS Connect (예정) |

---

## 인증/인가 구조

```
로그인
  → JWT 발급 (payload: userId, email, role, permissions[])
  → /api/auth/me 응답에도 permissions 포함

매 API 요청
  → JwtAuthenticationFilter: JWT 파싱 → permissions 추출
  → UserPrincipal.getAuthorities(): [ROLE_ADMIN, USER_VIEW, USER_DELETE, ...]
  → SecurityContext 등록
  → @PreAuthorize("hasAuthority('USER_DELETE')") 체크

프론트
  → authStore.user.permissions 저장
  → usePermission("USER_DELETE") 훅으로 버튼 조건부 렌더
```

### Role / Permission 구조

- `roles` 테이블 — ROLE_ADMIN, ROLE_USER 등
- `permissions` 테이블 — USER_VIEW, USER_CREATE, USER_EDIT, USER_DELETE, ROLE_VIEW, ROLE_EDIT 등
- `role_permissions` 테이블 — 역할과 권한의 N:M 매핑
- 로그인 시 해당 역할에 매핑된 권한 목록을 JWT에 포함

---

## 완료된 기능

### 인증 (Auth)
- [x] 회원가입 (`POST /api/auth/signup`)
- [x] 이메일 중복 확인 (`GET /api/auth/check-email`)
- [x] 로그인 (`POST /api/auth/login`) — JWT access + refresh 발급, permissions 포함
- [x] 토큰 갱신 (`POST /api/auth/refresh`) — Refresh Token Rotation
- [x] 로그아웃 (`POST /api/auth/logout`)
- [x] 내 정보 조회 (`GET /api/auth/me`) — permissions 포함

### 인가 (Authorization)
- [x] Role/Permission/RolePermission CRUD API
- [x] JWT payload에 permissions[] 포함
- [x] JwtAuthenticationFilter — permissions → SecurityContext 등록
- [x] UserPrincipal.getAuthorities() — role + permissions 모두 반환
- [x] 403 접근 거부 시 AlertDialog + 홈 리다이렉트

### 유저 관리
- [x] 유저 목록 조회/생성/삭제 (`/api/users`)
- [x] 역할 변경, 활성/비활성 토글
- [x] 관리자 전용 페이지 접근 제어

### 프론트엔드
- [x] 회원가입 / 로그인 페이지
- [x] 대시보드, 유저/역할/권한 관리 페이지
- [x] 프로필 페이지 (`/profile`) — 내 역할 및 권한 확인, 메모장/즐겨찾기 탭
- [x] 헤더 유저 드롭다운 → 프로필 이동
- [x] axios 인터셉터 — 401 시 자동 토큰 갱신, 병렬 요청 큐잉
- [x] TanStack Store 기반 auth 상태 관리

### 공통
- [x] Swagger UI (`http://localhost:4101/swagger-ui/index.html`)
- [x] 통일된 에러 응답 형식 (`{code, message, timestamp, fieldErrors}`)
- [x] GlobalExceptionHandler — AuthorizationDeniedException → 403 처리

---

## 개발 환경 세팅

### 필수 도구

- Java 21+
- Node.js 20+
- Docker Desktop

### 1. DB 실행

```bash
docker compose up -d
```

PostgreSQL이 `localhost:5434`에서 기동됩니다.  
앱 최초 실행 시 `RoleSeeder`가 기본 역할(ROLE_ADMIN, ROLE_USER)을 자동 생성합니다.

### 2. 백엔드 실행

```bash
cd pilot-callcenter-server
./gradlew bootRun
```

`http://localhost:4101` 기동. Swagger: `http://localhost:4101/swagger-ui/index.html`

### 3. 프론트엔드 실행

```bash
cd pilot-callcenter-front
npm install
npm run dev
```

`http://localhost:4100` 기동.

### 환경 변수

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4101` | 백엔드 API URL |

---

## 포트 정보

| 서비스 | 포트 |
|--------|------|
| Frontend (Next.js) | 4100 |
| Backend (Spring Boot) | 4101 |
| PostgreSQL | 5434 |

---

## API — 상담 기록

```
POST  /api/calls/start
      Body: { "contactId": "(선택)", "fromNumber": "010-xxxx-xxxx", "toNumber": "02-xxxx-xxxx" }

PATCH /api/calls/{callSid}/end
      Body: { "durationSec": 120 }

GET   /api/calls
```

---

## 에러 코드

| 코드 | HTTP | 의미 |
|------|------|------|
| AUTH_001 | 409 | 이메일 중복 |
| AUTH_002 | 404 | 사용자 없음 |
| AUTH_003 | 401 | 이메일/비밀번호 불일치 |
| AUTH_004 | 403 | 비활성 계정 |
| AUTH_005 | 401 | 유효하지 않은 토큰 |
| AUTH_006 | 401 | 유효하지 않은 리프레시 토큰 |
| COMMON_001 | 400 | 입력값 검증 실패 |
| COMMON_002 | 403 | 접근 권한 없음 |
| COMMON_999 | 500 | 서버 오류 |
