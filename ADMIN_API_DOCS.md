# 원데이 클래스 관리자 API 문서

ERP 팀을 위한 관리자 API 엔드포인트 명세서입니다.

## 목차
1. [인증 및 권한](#인증-및-권한)
2. [클래스 관리 API](#클래스-관리-api)
3. [통계 API](#통계-api)
4. [데이터베이스 스키마](#데이터베이스-스키마)
5. [상태 코드 및 에러 처리](#상태-코드-및-에러-처리)

---

## 인증 및 권한

### 관리자 권한 확인
모든 관리자 API는 `userId` 파라미터를 통해 관리자 권한을 확인합니다.

**권한 체크 로직:**
```typescript
// User 테이블의 role 필드가 'admin'인 경우만 허용
user.role === 'admin'
```

**테스트용 관리자 계정 설정:**
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

---

## 클래스 관리 API

### 1. 클래스 목록 조회

**Endpoint:** `GET /api/admin/classes`

**설명:** 관리자가 클래스 목록을 조회합니다. 상태별, 카테고리별 필터링 가능.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|------|--------|------|
| userId | number | ✅ | - | 관리자 ID |
| status | string | ❌ | - | pending, approved, rejected, active, inactive |
| search | string | ❌ | - | 제목/설명 검색 |
| category | string | ❌ | - | farming, crafts, cooking, culture, nature |
| sortBy | string | ❌ | createdAt | createdAt, title, price, averageRating |
| sortOrder | string | ❌ | DESC | ASC, DESC |
| limit | number | ❌ | 20 | 페이지당 항목 수 |
| offset | number | ❌ | 0 | 오프셋 |

**Response 예시:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx123",
      "title": "전통 도자기 만들기",
      "description": "...",
      "category": "crafts",
      "status": "pending",
      "price": 50000,
      "duration": 180,
      "province": "부산광역시",
      "city": "기장군",
      "createdAt": "2025-12-28T10:00:00Z",
      "updatedAt": "2025-12-28T10:00:00Z",
      "instructor": {
        "id": 5,
        "nickname": "도자기장인",
        "createdAt": "2025-01-01T00:00:00Z"
      },
      "_count": {
        "sessions": 3,
        "enrollments": 0,
        "reviews": 0
      }
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0
}
```

**사용 예시:**
```javascript
// 승인 대기 중인 클래스만 조회
const response = await fetch('/api/admin/classes?userId=1&status=pending&limit=10');

// 거부된 클래스 검색
const response = await fetch('/api/admin/classes?userId=1&status=rejected&search=도자기');
```

---

### 2. 클래스 상세 조회

**Endpoint:** `GET /api/admin/classes/[id]`

**설명:** 클래스의 상세 정보를 조회합니다. 강사 정보, 세션, 수강생, 리뷰 포함.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | number | ✅ | 관리자 ID |

**Response 예시:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "title": "전통 도자기 만들기",
    "description": "전통 방식으로 도자기를 만들어보는 체험입니다...",
    "category": "crafts",
    "subCategory": "pottery",
    "status": "pending",
    "rejectionReason": null,
    "approvedAt": null,
    "approvedBy": null,
    "price": 50000,
    "originalPrice": 70000,
    "duration": 180,
    "difficulty": "beginner",
    "minAge": 10,
    "maxAge": 100,
    "province": "부산광역시",
    "city": "기장군",
    "district": "정관읍",
    "address": "정관로 123",
    "locationDetail": "정관 새마을 회관 2층",
    "thumbnailUrl": "https://example.com/image.jpg",
    "materials": ["앞치마", "장갑"],
    "includes": ["재료비", "완성품 배송"],
    "createdAt": "2025-12-28T10:00:00Z",
    "updatedAt": "2025-12-28T10:00:00Z",
    "instructor": {
      "id": 5,
      "nickname": "도자기장인",
      "createdAt": "2025-01-01T00:00:00Z",
      "coinBalance": 150000,
      "_count": {
        "instructorClasses": 8,
        "classEnrollments": 45
      }
    },
    "sessions": [
      {
        "id": "sess123",
        "sessionDate": "2025-12-30T00:00:00Z",
        "startTime": "14:00",
        "endTime": "17:00",
        "maxCapacity": 10,
        "currentEnrolled": 3,
        "status": "open",
        "notes": "주차 가능",
        "createdAt": "2025-12-28T10:05:00Z"
      }
    ],
    "enrollments": [
      {
        "id": "enroll123",
        "userId": 10,
        "status": "confirmed",
        "paidAmount": 50000,
        "participants": 1,
        "enrolledAt": "2025-12-28T11:00:00Z",
        "user": {
          "id": 10,
          "nickname": "체험러버"
        },
        "session": {
          "sessionDate": "2025-12-30T00:00:00Z",
          "startTime": "14:00"
        }
      }
    ],
    "reviews": []
  }
}
```

---

### 3. 클래스 승인

**Endpoint:** `POST /api/admin/classes/[id]/approve`

**설명:** 대기 중인 클래스를 승인하여 공개합니다.

**Request Body:**
```json
{
  "userId": 1
}
```

**Response 예시:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "title": "전통 도자기 만들기",
    "status": "approved",
    "approvedAt": "2025-12-28T12:00:00Z",
    "approvedBy": 1,
    "rejectionReason": null,
    "instructor": {
      "id": 5,
      "nickname": "도자기장인"
    }
  },
  "message": "클래스가 승인되었습니다."
}
```

**사용 예시:**
```javascript
const response = await fetch('/api/admin/classes/clxxx123/approve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 1 })
});
```

---

### 4. 클래스 거부

**Endpoint:** `POST /api/admin/classes/[id]/reject`

**설명:** 클래스를 거부하고 거부 사유를 강사에게 전달합니다.

**Request Body:**
```json
{
  "userId": 1,
  "reason": "클래스 설명이 부족합니다. 준비물과 진행 방식을 더 자세히 기재해주세요."
}
```

**Response 예시:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "title": "전통 도자기 만들기",
    "status": "rejected",
    "rejectionReason": "클래스 설명이 부족합니다. 준비물과 진행 방식을 더 자세히 기재해주세요.",
    "approvedAt": null,
    "approvedBy": null,
    "instructor": {
      "id": 5,
      "nickname": "도자기장인"
    }
  },
  "message": "클래스가 거부되었습니다."
}
```

**유효성 검증:**
- `reason` 필드는 필수이며 빈 문자열 불가

---

### 5. 클래스 상태 변경

**Endpoint:** `PATCH /api/admin/classes/[id]/status`

**설명:** 승인된 클래스를 활성화/비활성화합니다.

**Request Body:**
```json
{
  "userId": 1,
  "status": "active"
}
```

**허용 상태:**
- `active`: 활성화 (사용자에게 노출)
- `inactive`: 비활성화 (숨김)

**Response 예시:**
```json
{
  "success": true,
  "data": {
    "id": "clxxx123",
    "status": "active",
    "updatedAt": "2025-12-28T12:30:00Z"
  },
  "message": "클래스가 활성화되었습니다."
}
```

**제약 사항:**
- `pending` 상태의 클래스는 상태 변경 불가 (먼저 승인/거부 필요)

---

## 통계 API

### 통계 조회

**Endpoint:** `GET /api/admin/stats`

**설명:** 원데이 클래스 전체 통계를 조회합니다.

**Query Parameters:**
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| userId | number | ✅ | 관리자 ID |

**Response 예시:**
```json
{
  "success": true,
  "data": {
    "classes": {
      "pending": 12,
      "approved": 34,
      "rejected": 8,
      "active": 28,
      "total": 82
    },
    "instructors": 15,
    "enrollments": 234,
    "revenue": 11700000
  }
}
```

**필드 설명:**
- `classes.pending`: 승인 대기 중
- `classes.approved`: 승인됨 (아직 활성화 전)
- `classes.rejected`: 거부됨
- `classes.active`: 활성화됨 (사용자에게 노출 중)
- `classes.total`: 전체 클래스 수
- `instructors`: 강사 수
- `enrollments`: 총 수강 신청 건수
- `revenue`: 총 수익 (코인)

---

## 데이터베이스 스키마

### OneDayClass 테이블

```prisma
model OneDayClass {
  id               String   @id @default(cuid())
  instructorId     Int

  // 기본 정보
  title            String
  description      String   @db.Text
  category         String   // farming, crafts, cooking, culture, nature
  subCategory      String?

  // 위치
  province         String
  city             String
  district         String
  address          String?
  locationDetail   String?

  // 가격 & 시간
  price            Int      // 코인 가격
  originalPrice    Int?
  duration         Int      // 분 단위

  // 난이도
  difficulty       String   // beginner, intermediate, advanced
  minAge           Int?
  maxAge           Int?

  // 미디어
  thumbnailUrl     String?
  imageUrls        Json?

  // 추가 정보
  materials        Json?    // 준비물 배열
  includes         Json?    // 포함 사항 배열

  // 통계 (비정규화)
  likesCount       Int      @default(0)
  bookmarksCount   Int      @default(0)
  enrollmentsCount Int      @default(0)
  reviewsCount     Int      @default(0)
  averageRating    Float    @default(0)

  // 승인 관련 (신규)
  status           String   @default("pending")  // pending, approved, rejected, active, inactive
  rejectionReason  String?  @db.Text
  approvedAt       DateTime?
  approvedBy       Int?

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### User 테이블 (role 필드 추가)

```prisma
model User {
  id          Int      @id @default(autoincrement())
  nickname    String   @unique
  password    String
  coinBalance Int      @default(0)
  role        String   @default("user")  // user, instructor, admin (신규)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 상태 코드 및 에러 처리

### HTTP 상태 코드

| 코드 | 의미 | 사용 케이스 |
|------|------|------------|
| 200 | OK | 성공 |
| 400 | Bad Request | 잘못된 요청 (필수 파라미터 누락 등) |
| 401 | Unauthorized | 인증 필요 (userId 없음) |
| 403 | Forbidden | 권한 없음 (관리자 아님) |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |

### 에러 응답 형식

```json
{
  "success": false,
  "error": "에러 메시지"
}
```

### 일반적인 에러 메시지

```json
// 인증 필요
{
  "success": false,
  "error": "인증이 필요합니다."
}

// 권한 없음
{
  "success": false,
  "error": "관리자 권한이 필요합니다."
}

// 리소스 없음
{
  "success": false,
  "error": "클래스를 찾을 수 없습니다."
}

// 유효성 검증 실패
{
  "success": false,
  "error": "거부 사유를 입력해주세요."
}
```

---

## 클래스 상태 플로우

```
[강사가 등록]
    ↓
pending (승인 대기)
    ↓
    ├─→ [관리자 승인] → approved (승인됨)
    │                      ↓
    │                  [관리자 활성화]
    │                      ↓
    │                  active (활성화 - 사용자에게 노출)
    │                      ↓
    │                  [관리자 비활성화]
    │                      ↓
    │                  inactive (비활성화 - 숨김)
    │
    └─→ [관리자 거부] → rejected (거부됨)
```

**상태별 설명:**
- `pending`: 강사가 등록한 직후, 관리자 검토 대기 중
- `approved`: 관리자가 승인함, 아직 사용자에게 노출되지 않음
- `rejected`: 관리자가 거부함, 거부 사유 포함
- `active`: 관리자가 활성화, 사용자에게 노출됨
- `inactive`: 일시적으로 비활성화, 숨김 처리

---

## 개발 팁

### 1. 테스트용 관리자 계정 생성

```sql
-- 관리자 권한 부여
UPDATE users SET role = 'admin' WHERE id = 1;

-- 확인
SELECT id, nickname, role FROM users WHERE role = 'admin';
```

### 2. 테스트용 pending 클래스 생성

```sql
-- 임의의 클래스를 pending 상태로 변경
UPDATE oneday_classes SET status = 'pending' WHERE id = 'clxxx123';
```

### 3. Postman/Insomnia 테스트 예시

**승인 대기 클래스 조회:**
```
GET http://localhost:3000/api/admin/classes?userId=1&status=pending
```

**클래스 승인:**
```
POST http://localhost:3000/api/admin/classes/clxxx123/approve
Content-Type: application/json

{
  "userId": 1
}
```

**클래스 거부:**
```
POST http://localhost:3000/api/admin/classes/clxxx123/reject
Content-Type: application/json

{
  "userId": 1,
  "reason": "클래스 설명이 부족합니다."
}
```

---

## 향후 확장 가능성

### 알림 시스템 (TODO)
- 승인/거부 시 강사에게 실시간 알림
- 이메일/SMS 통지

### 배치 작업
- 일괄 승인/거부
- 자동 만료 처리

### 상세 로그
- 관리자 활동 로그
- 승인/거부 이력 추적

---

## 문의사항

API 관련 문의나 버그 제보는 프론트엔드 팀에게 연락주세요.

**작성일:** 2025-12-28
**버전:** 1.0.0
