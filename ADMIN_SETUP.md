# 관리자 ERP 시스템 설정 가이드

## 1. 관리자 계정 생성

관리자 페이지에 접근하려면 `role`이 `'admin'`인 사용자 계정이 필요합니다.

### SQL을 통한 관리자 권한 부여

```sql
-- 기존 사용자를 관리자로 변경 (userId = 1)
UPDATE users SET role = 'admin' WHERE id = 1;

-- 또는 새 관리자 계정 생성
INSERT INTO users (nickname, password, role, "coinBalance", "createdAt", "updatedAt")
VALUES ('admin', '$2a$10$...해시된비밀번호...', 'admin', 0, NOW(), NOW());
```

### Prisma Studio를 통한 관리자 권한 부여

```bash
npx prisma studio
```

1. Prisma Studio 실행
2. `User` 테이블 선택
3. 관리자로 만들 사용자 선택
4. `role` 필드를 `admin`으로 변경
5. 저장

## 2. 접근 방법

관리자 페이지는 다음 URL로 접근할 수 있습니다:

```
http://localhost:3000/admin
```

## 3. 로그인

관리자 권한이 있는 계정으로 로그인하면 ERP 시스템에 접근할 수 있습니다.

- 닉네임: (관리자 계정의 닉네임)
- 비밀번호: (관리자 계정의 비밀번호)

## 4. ERP 모듈 구성

### 현재 구현된 기능

1. **대시보드**
   - 전체 통계 현황
   - 클래스 승인 현황
   - 빠른 작업 메뉴

2. **원데이 클래스 관리** ✅ 완전 구현
   - 클래스 목록 조회
   - 상태별 필터링 (pending, approved, rejected, active, inactive)
   - 클래스 승인/거부
   - 클래스 상세 정보 조회

3. **회원 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/users` 엔드포인트 구현 필요

4. **빈집 매물 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/properties` 엔드포인트 구현 필요

5. **커뮤니티 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/community` 엔드포인트 구현 필요

6. **코인 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/coins` 엔드포인트 구현 필요

7. **채팅방 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/chat` 엔드포인트 구현 필요

8. **뱃지 관리** ⚠️ API 필요
   - UI 구현 완료
   - `/api/admin/badges` 엔드포인트 구현 필요

## 5. 추가 구현이 필요한 API 엔드포인트

### 회원 관리 API

```typescript
// src/app/api/admin/users/route.ts
GET /api/admin/users?userId=1&role=&search=&limit=20&offset=0
```

### 매물 관리 API

```typescript
// src/app/api/admin/properties/route.ts
GET /api/admin/properties?userId=1&status=&search=&limit=20&offset=0
POST /api/admin/properties/[id]/approve
POST /api/admin/properties/[id]/reject
```

### 커뮤니티 관리 API

```typescript
// src/app/api/admin/community/route.ts
GET /api/admin/community?userId=1&category=&search=&limit=20&offset=0
DELETE /api/admin/community/[id]
```

### 코인 관리 API

```typescript
// src/app/api/admin/coins/route.ts
GET /api/admin/coins/transactions?userId=1&type=&limit=20&offset=0
GET /api/admin/coins/stats?userId=1
```

### 채팅방 관리 API

```typescript
// src/app/api/admin/chat/route.ts
GET /api/admin/chat/rooms?userId=1
GET /api/admin/chat/rooms/[id]/messages?userId=1
DELETE /api/admin/chat/messages/[id]
```

### 뱃지 관리 API

```typescript
// src/app/api/admin/badges/route.ts
GET /api/admin/badges?userId=1
POST /api/admin/badges
PUT /api/admin/badges/[id]
DELETE /api/admin/badges/[id]
```

## 6. 보안 고려사항

모든 관리자 API는 다음을 확인해야 합니다:

1. **인증 확인**: `userId` 파라미터 필수
2. **권한 확인**: `user.role === 'admin'` 체크
3. **에러 처리**: 적절한 HTTP 상태 코드 반환

```typescript
// 권한 체크 예시
import { isAdmin } from '@/lib/admin';

const userId = searchParams.get('userId');
if (!userId) {
  return NextResponse.json(
    { success: false, error: '인증이 필요합니다.' },
    { status: 401 }
  );
}

const hasPermission = await isAdmin(parseInt(userId));
if (!hasPermission) {
  return NextResponse.json(
    { success: false, error: '관리자 권한이 필요합니다.' },
    { status: 403 }
  );
}
```

## 7. 개발 진행 순서

1. ✅ 관리자 페이지 레이아웃 및 네비게이션
2. ✅ 관리자 로그인 시스템
3. ✅ 대시보드 (원데이 클래스 통계)
4. ✅ 원데이 클래스 관리 (완전 구현)
5. ⏳ 회원 관리 API 구현
6. ⏳ 매물 관리 API 구현
7. ⏳ 커뮤니티 관리 API 구현
8. ⏳ 코인 관리 API 구현
9. ⏳ 채팅방 관리 API 구현
10. ⏳ 뱃지 관리 API 구현

## 8. 참고 문서

- [원데이 클래스 관리자 API 문서](./ADMIN_API_DOCS.md)
- Prisma Schema: `prisma/schema.prisma`
- 관리자 유틸리티: `src/lib/admin.ts`
