# 빈집다방 UI/UX 디자인 가이드라인 (v2.0)

본 문서는 빈집다방 서비스의 리뉴얼된 디자인 컨셉인 Stone & Warm 테마를 정의합니다. 모든 페이지 개발 시 본 가이드라인을 준수하여 일관된 사용자 경험을 제공해야 합니다.

## 1\. 디자인 원칙 (Design Principles)

  * **Warm & Cozy:** 차가운 디지털 느낌을 지양하고, 따뜻한 크림 및 스톤 톤을 사용하여 시골의 아늑함을 전달합니다.
  * **Minimal & Clean:** 불필요한 장식, 과한 그라데이션, 높은 채도의 색상을 배제합니다. 여백을 충분히 활용합니다.
  * **Emotional Typography:** 제목에는 세리프(Serif) 서체를 사용하여 감성적인 무드를, 본문에는 산세리프(Sans-serif)를 사용하여 가독성을 확보합니다.
  * **Texture & Depth:** 종이 질감의 배경색과 은은한 그림자, 보더(Border)를 사용하여 매거진과 같은 깊이감을 줍니다.

## 2\. 컬러 시스템 (Color System)

테일윈드 CSS(Tailwind CSS)의 기본 색상 팔레트를 기반으로 합니다.

### 배경 (Background)

  * **Main Background:** `#F5F5F0` (bg-[\#F5F5F0]) - 앱 전체의 기본 배경색 (웜 그레이/크림)
  * **Card Background:** `#FFFFFF` (bg-white) - 콘텐츠 영역, 카드 배경
  * **Sub Background:** `#FAFAF9` (bg-stone-50) - 입력창, 보조 구역 배경

### 텍스트 (Typography Color)

  * **Primary Text:** `#292524` (text-stone-800) - 주요 제목, 강조 텍스트, 메인 버튼 텍스트
  * **Secondary Text:** `#57534E` (text-stone-600) - 본문, 설명 텍스트
  * **Tertiary Text:** `#78716C` (text-stone-500) - 부가 정보, 날짜, 비활성 텍스트
  * **Caption/Placeholder:** `#A8A29E` (text-stone-400)

### 포인트 및 상태 (Accent & Status)

  * **Primary Action:** `#292524` (bg-stone-800) - 주요 버튼 배경 (검정에 가까운 다크 그레이)
  * **Highlight / Brand:** `#EA580C` (text-orange-600, bg-orange-500) - 가격 정보, 좋아요, 매칭 점수, 배지, 알림
  * **Borders:** `#E7E5E4` (border-stone-200) - 카드 테두리, 구분선

## 3\. 타이포그래피 (Typography)

### 폰트 패밀리

  * **Title Font:** 프로젝트에 설정된 커스텀 폰트 클래스 `title-font` 또는 `font-serif`
  * **Body Font:** 기본 `font-sans` (Pretendard 또는 시스템 폰트)

### 계층 구조 (Hierarchy)

  * **Display (로고):** `title-font text-3xl` (메인 헤더 로고)
  * **Page Title:** `font-serif font-bold text-2xl text-stone-800` (페이지 대제목)
  * **Section Title:** `font-serif font-bold text-lg text-stone-800` (섹션 구분 제목)
  * **Body Strong:** `font-sans font-bold text-sm text-stone-800` (카드 제목, 강조 본문)
  * **Body Regular:** `font-sans font-medium text-sm text-stone-600` (일반 본문)
  * **Caption:** `font-sans text-xs text-stone-500` (설명, 태그)

## 4\. 레이아웃 및 그리드 (Layout)

### 모바일 컨테이너

모바일 중심의 UI를 위해 중앙 정렬된 컨테이너를 사용합니다.

```tsx
<div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
  <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl flex flex-col">
    {/* Content */}
  </div>
</div>
```

### 여백 (Spacing)

  * **Page Padding:** 좌우 여백 `px-6` (24px)을 기본으로 사용하여 시원한 느낌을 줍니다.
  * **Section Spacing:** 섹션 간 간격은 `space-y-6` 또는 `mb-8` 등으로 넉넉하게 잡습니다.

## 5\. UI 컴포넌트 (Components)

### 버튼 (Buttons)

버튼은 넉넉한 터치 영역과 둥근 모서리를 가집니다.

  * **Primary Button (메인 액션)**
      * 스타일: `w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors shadow-lg`
  * **Secondary Button (보조 액션)**
      * 스타일: `w-full py-4 bg-stone-100 text-stone-600 rounded-xl font-medium hover:bg-stone-200 transition-colors`
  * **Floating Button (아이콘)**
      * 스타일: `p-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors`

### 카드 (Cards)

매거진 스타일의 깔끔한 카드 디자인을 사용합니다.

  * **기본 카드:** `bg-white rounded-2xl border border-stone-200 shadow-sm p-5`
  * **이미지 카드:** 상단에 이미지가 꽉 차고 하단에 텍스트가 있는 형태.
  * **인터랙션:** Hover 시 `border-stone-300` 또는 `shadow-md`로 전환, `active:scale-95` 등으로 클릭감 제공.

### 태그 및 배지 (Tags & Badges)

  * **기본 태그:** `px-2.5 py-1 bg-white border border-stone-200 rounded-full text-[11px] text-stone-600`
  * **강조 배지 (가격/점수):** `bg-stone-900 text-white` 또는 `bg-orange-500 text-white`

### 내비게이션 (Navigation)

  * **헤더 (Top Bar):** `sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-100`
  * **하단 바 (Bottom Bar):** `fixed bottom-0 bg-white border-t border-stone-100`. 아이콘과 텍스트 레이블(10px) 조합. 활성 상태는 `text-stone-900`, 비활성 상태는 `text-stone-400`.

## 6\. 아이콘 및 이미지 (Iconography & Imagery)

  * **아이콘:** `lucide-react` 라이브러리 사용. 선 두께(stroke-width)는 기본 또는 1.5로 얇고 세련되게 유지.
  * **이미지:** 모든 이미지는 `object-cover` 속성을 사용하여 비율을 유지하며 꽉 채움.
  * **플레이스홀더:** 이미지 로딩 실패 또는 없을 시 `bg-stone-100` 배경에 `Home` 아이콘 등을 중앙 배치.

## 7\. 인터랙션 및 모션 (Interaction)

  * **페이지 전환:** 자연스러운 흐름 유지.
  * **모달/팝업:** 배경은 `bg-stone-900/60 backdrop-blur-sm`. 모달 창은 화면 중앙 또는 하단 시트(Sheet) 형태.
  * **스크롤:** `scrollbar-hide` 클래스를 사용하여 스크롤바를 숨기되 기능은 유지하여 깔끔한 UI 제공.