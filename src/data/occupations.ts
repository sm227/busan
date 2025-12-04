// 한국 일반 직업 목록 (표준직업분류 기반, 엄선된 ~150개)
export const occupations = [
  // IT/기술
  "개발자",
  "프로그래머",
  "소프트웨어 엔지니어",
  "데이터 분석가",
  "데이터 사이언티스트",
  "시스템 엔지니어",
  "네트워크 엔지니어",
  "보안 전문가",
  "IT 컨설턴트",

  // 디자인/예술
  "디자이너",
  "그래픽 디자이너",
  "UX/UI 디자이너",
  "웹 디자이너",
  "제품 디자이너",
  "작가",
  "예술가",
  "화가",
  "조각가",
  "사진작가",
  "영상 제작자",
  "유튜버",
  "크리에이터",

  // 교육
  "교사",
  "교수",
  "강사",
  "학원 강사",
  "유치원 교사",
  "초등학교 교사",
  "중학교 교사",
  "고등학교 교사",
  "대학 교수",
  "연구원",

  // 의료/보건
  "의사",
  "간호사",
  "약사",
  "한의사",
  "치과의사",
  "수의사",
  "물리치료사",
  "작업치료사",
  "임상병리사",
  "방사선사",
  "응급구조사",

  // 법률/행정
  "변호사",
  "판사",
  "검사",
  "법무사",
  "변리사",
  "공무원",
  "행정직 공무원",
  "경찰관",
  "소방관",
  "군인",

  // 경영/사무
  "회사원",
  "사무직",
  "관리자",
  "경영자",
  "CEO",
  "임원",
  "팀장",
  "과장",
  "대리",
  "사원",
  "인사 담당자",
  "회계사",
  "세무사",
  "감정평가사",
  "재무 분석가",

  // 영업/마케팅
  "영업사원",
  "마케터",
  "광고 기획자",
  "홍보 담당자",
  "브랜드 매니저",

  // 서비스
  "자영업자",
  "사업가",
  "요식업 종사자",
  "카페 운영자",
  "음식점 운영자",
  "편의점 운영자",
  "미용사",
  "헤어 디자이너",
  "네일 아티스트",
  "피부 관리사",
  "상담사",
  "심리상담사",
  "여행 가이드",

  // 건설/제조
  "건축가",
  "건축 기술자",
  "토목 기사",
  "전기 기사",
  "기계 기사",
  "용접사",
  "목수",
  "배관공",
  "전기공",

  // 농축수산
  "농업인",
  "농부",
  "축산업자",
  "어업인",
  "임업인",

  // 운송/물류
  "운전기사",
  "택시 기사",
  "버스 기사",
  "트럭 기사",
  "배달원",
  "택배 기사",
  "물류 관리자",

  // 금융/보험
  "은행원",
  "금융 전문가",
  "보험 설계사",
  "증권 애널리스트",
  "펀드 매니저",

  // 미디어/방송
  "기자",
  "PD",
  "아나운서",
  "방송작가",
  "편집자",
  "출판 기획자",

  // 문화/체육
  "운동선수",
  "코치",
  "체육 교사",
  "트레이너",
  "요가 강사",
  "필라테스 강사",
  "배우",
  "가수",
  "음악가",
  "댄서",
  "개그맨",

  // 기타
  "프리랜서",
  "컨설턴트",
  "번역가",
  "통역사",
  "학생",
  "대학생",
  "대학원생",
  "취업 준비생",
  "은퇴자",
  "주부",
  "무직",
  "기타",
];

// 한글 초성 추출 함수
const CHOSUNG = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

export function getInitialConsonants(text: string): string {
  let result = "";

  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);

    // 한글 유니코드 범위: 0xAC00 ~ 0xD7A3
    if (char >= 0xAC00 && char <= 0xD7A3) {
      const chosungIndex = Math.floor((char - 0xAC00) / 588);
      result += CHOSUNG[chosungIndex];
    } else {
      // 한글이 아닌 경우 그대로 추가
      result += text[i];
    }
  }

  return result;
}

// 직업 검색 함수
export function searchOccupations(query: string, list: string[] = occupations): string[] {
  if (!query || query.trim() === "") {
    // 검색어가 없으면 인기 직업 7개 반환
    return list.slice(0, 7);
  }

  const lowerQuery = query.toLowerCase().trim();

  const results = list.filter(occupation => {
    const lowerOccupation = occupation.toLowerCase();

    // 1. 완전 일치 (우선순위 높음)
    if (lowerOccupation === lowerQuery) return true;

    // 2. 시작 부분 일치
    if (lowerOccupation.startsWith(lowerQuery)) return true;

    // 3. 부분 문자열 일치
    if (lowerOccupation.includes(lowerQuery)) return true;

    // 4. 초성 검색
    const occupationChosung = getInitialConsonants(occupation);
    if (occupationChosung.includes(lowerQuery)) return true;

    return false;
  });

  // 정렬: 완전 일치 > 시작 일치 > 부분 일치
  results.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();

    if (aLower === lowerQuery) return -1;
    if (bLower === lowerQuery) return 1;

    if (aLower.startsWith(lowerQuery) && !bLower.startsWith(lowerQuery)) return -1;
    if (!aLower.startsWith(lowerQuery) && bLower.startsWith(lowerQuery)) return 1;

    return 0;
  });

  // 최대 7개만 반환
  return results.slice(0, 7);
}
