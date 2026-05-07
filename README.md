# BeautyBook — Auth Boilerplate

Next.js + Spring Boot 기반 **인증·인가 보일러플레이트**입니다.
이메일 인증 회원가입, JWT 로그인, RBAC 역할·권한 관리, DB 기반 헤더 메뉴, 다국어, 테마 스위처까지 포함한 관리자 콘솔 스타터입니다.

| 영역 | 스택 |
| --- | --- |
| Frontend | Next.js 16, React 19, Tailwind v4, TanStack Query, react-hook-form + zod, i18next |
| Backend | Spring Boot 3, Spring Security, Spring Data JPA, JWT |
| DB | PostgreSQL 15 |
| Infra | Docker Compose |

---

## 사전 요구사항

| 도구 | 버전 |
| --- | --- |
| Java | 21 |
| Node.js | 18 이상 |
| Docker | 최신 |

---

## 빠른 시작

### 1. DB 실행

```bash
docker compose up -d postgres
```

### 2. 백엔드 실행

```bash
cd beauty-book-server
cp .env.example .env      # 환경변수 파일 생성
./gradlew bootRun
```

| 항목 | 값 |
| --- | --- |
| API | http://localhost:4101 |
| Swagger | http://localhost:4101/swagger-ui/index.html |

### 3. 프론트엔드 실행

```bash
cd beauty-book--front
npm install
npm run dev
```

| 항목 | 값 |
| --- | --- |
| URL | http://localhost:4100 |

> 프론트는 기본적으로 `http://localhost:4101` 을 백엔드로 바라봅니다. 백엔드 URL이 다르면 아래 환경변수 섹션 참고.

---

## 환경변수

### 백엔드 — `beauty-book-server/.env`

`.env.example` 을 복사해서 사용합니다.

| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `JWT_SECRET` | (예시 값) | JWT 서명 비밀키 — **32바이트 이상** 필수, 운영 환경에서 반드시 교체 |
| `MAIL_USERNAME` | — | Gmail 계정 주소 |
| `MAIL_PASSWORD` | — | Gmail 앱 비밀번호 ([발급 방법](#gmail-앱-비밀번호-발급)) |
| `MAIL_FROM` | — | 발신자 주소 (보통 `MAIL_USERNAME` 과 동일) |
| `AUTH_EMAIL_VERIFICATION_LOG_ONLY` | `true` | `true` = 실제 메일 발송 없이 서버 로그에만 출력 |
| `AUTH_EMAIL_VERIFICATION_DEV_BYPASS_CODE` | `1234` | 이 값을 코드로 입력하면 항상 인증 통과 (로컬 개발용) |
| `AWS_ACCESS_KEY_ID` | — | S3 파일 업로드용 (미사용 시 비워도 무방) |
| `AWS_SECRET_ACCESS_KEY` | — | 위와 동일 |
| `AWS_S3_BUCKET_NAME` | — | 위와 동일 |

### 프론트엔드 — `beauty-book--front/.env.local`

파일이 없으면 `http://localhost:4101` 을 기본값으로 사용합니다.

```bash
# beauty-book--front/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4101
```

---

## 이메일 인증 설정

### 로컬 개발 (기본값, SMTP 불필요)

`.env` 에서 아래 두 값이 기본으로 설정됩니다.

```env
AUTH_EMAIL_VERIFICATION_LOG_ONLY=true
AUTH_EMAIL_VERIFICATION_DEV_BYPASS_CODE=1234
```

- 회원가입 시 인증코드가 **서버 로그**에 출력됩니다.
- 프론트 코드 입력란의 기본값이 `1234` 이므로 **코드 입력 없이 바로 인증 통과**가 됩니다.

### 실제 Gmail SMTP 사용

1. Google 계정 → 보안 → **앱 비밀번호** 발급 (2단계 인증 활성화 필요)
2. `.env` 수정:

```env
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx   # 앱 비밀번호 (공백 없이)
MAIL_FROM=your@gmail.com
AUTH_EMAIL_VERIFICATION_LOG_ONLY=false
AUTH_EMAIL_VERIFICATION_DEV_BYPASS_CODE=   # 운영 환경은 비워둘 것
```

---

## 새 프로젝트로 파생

이 저장소를 보일러플레이트로 복사할 때는 스크립트를 사용합니다. 로컬 생성물과 시크릿 파일은 자동 제외됩니다.

```bash
scripts/create-project-from-template.sh \
  /path/to/NewProject \   # 새 프로젝트 생성 경로
  new-project \            # kebab-case 슬러그 (폴더명·컨테이너명)
  NewProject \             # 표시 이름 (UI 브랜드명)
  new_project \            # PostgreSQL DB 이름
  com.example.newproject \ # Java 루트 패키지
  4200 \                   # Next.js 포트
  4201 \                   # Spring Boot 포트
  5435                     # 호스트 PostgreSQL 포트
```

생성 결과:

```
NewProject/
├── new-project-front/
├── new-project-server/
├── docker-compose.yml
└── README.md
```

---

## 아키텍처

### 백엔드 패키지 구조

DDD 4-Layer × 바운디드 컨텍스트 분리입니다.

```
com.cj.beautybook/
├── auth/
│   ├── domain/           # AuthAccount, AuthVerification, RefreshToken, enums
│   ├── infrastructure/   # AuthAccountRepository, AuthVerificationRepository, RefreshTokenRepository
│   ├── application/      # EmailVerificationService, EmailVerificationSender, EmailVerificationProperties
│   ├── presentation/dto/ # EmailSendCodeRequest/Response, EmailVerifyCodeRequest/Response
│   ├── security/         # JwtAuthenticationFilter, UserPrincipal, CustomUserDetailsService
│   └── jwt/              # JwtTokenProvider, JwtProperties, TokenType (ACCESS/REFRESH/EMAIL_VERIFICATION)
├── user/
│   └── domain/ application/ infrastructure/ presentation/(+dto)
├── role/
├── permission/
├── permission_category/
├── menu/                 # DB 기반 N차 헤더 메뉴 트리
└── common/               # 공통 응답·예외 처리
```

### 프론트엔드 폴더 구조

FSD (Feature-Sliced Design) 기반입니다.

```
beauty-book--front/src/
├── app/          # Next.js App Router 라우트 + 전역 Provider
├── widgets/      # 복합 UI (Header, Guards)
├── features/     # 비즈니스 플로우 (auth, user/role/permission-management)
├── entities/     # 도메인 모델 + API + 스토어 (user, permission, permission-category)
└── shared/       # 범용 UI, zod 스키마, axios, i18n
```

의존 방향: `app → widgets → features → entities → shared` (단방향)

---

## 주요 기능

**인증**
- 이메일 인증 회원가입 — send-code → verify-code → verifiedToken → signup
  - 인증코드 BCrypt 해싱, TTL 300초, 최대 실패 5회 제한
  - `auth_accounts` / `auth_verifications` 테이블 분리 (providerType + identifier 구조)
- JWT 로그인 (Access Token 30분 / Refresh Token 7일)
- 자동 토큰 갱신 (axios 인터셉터)

**관리자**
- 역할(Role) CRUD
- 권한(Permission) CRUD + 카테고리 분류
- 역할-권한 매핑 (체크박스 UI)
- 유저 역할 변경
- DB 기반 헤더 메뉴 관리 (N차 트리, 드래그 순서 변경, 역할별 가시성)

**UI**
- 브랜드 컬러 테마 스위처 (6색 팔레트, localStorage 지속)
- 다국어 — 한국어 / English / 日本語 / 中文

---

## 초기 데이터 & 가입 정책

앱 시작 시 자동 시딩:

| 시더 | 내용 |
| --- | --- |
| `RoleSeeder` | ROLE_ADMIN / ROLE_MANAGER / ROLE_USER |
| `PermissionCategorySeeder` | 기본 권한 카테고리 |
| `PermissionSeeder` | 기본 권한 9종 |
| `MenuSeeder` | 헤더 메뉴 기본 6개 |

## Default Roles

기본 롤은 `RoleSeeder`에서 관리합니다. 역할 관리가 보일러플레이트에 기본 탑재되어 있으므로, 새 프로젝트로 파생할 때는 **이 초기 롤 목록과 회원가입 기본 롤만** 프로젝트 성격에 맞게 교체하면 됩니다.

| 롤 | 설명 |
| --- | --- |
| `ROLE_ADMIN` | 시스템 전체 관리자 |
| `ROLE_MANAGER` | 중간 관리자 |
| `ROLE_USER` | 기본 가입자 |

가입 정책:
- **첫 번째 가입자** → 자동으로 `ROLE_ADMIN` 부여
- **이후 가입자** → 기본 `ROLE_USER`

> 파생 프로젝트에서는 `RoleSeeder.java` 롤 목록과 `AuthService.java` 의 `signupRoleCode` 기본값만 교체하면 됩니다. 기존 DB에 이미 등록된 롤은 시더가 덮어쓰지 않으므로 DB 초기화 후 적용됩니다.

---

## 테마 커스터마이징

`beauty-book--front/src/app/globals.css` 에서 `:root[data-theme="이름"]` 블록을 추가하고, `themeStore.ts` 의 `THEME_COLORS` 배열에 엔트리를 추가하면 새 테마가 등록됩니다.

현재 팔레트: `rose` / `amber` / `mint` / `lavender` / `peach` / `sky`

---

## 언어 추가 (i18n)

1. `src/shared/i18n/resources/<코드>/` 하위에 `common`, `nav`, `auth`, `form`, `index` TS 파일 작성
2. `src/shared/i18n/index.ts` 의 `resources` 와 `SUPPORTED_LANGUAGES` 에 등록
