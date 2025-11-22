export interface PopularPostData {
  id: number;
  title: string;
  content: string;
  author: string;
  category: 'review' | 'tips' | 'story' | 'news';
  location?: string;
  imageUrl?: string;
  views: number;
  likes: number;
  featured: boolean;
  createdAt: string;
}

export const popularPostsData: PopularPostData[] = [
  {
    id: 1,
    title: "강원도 홍천에서의 1년, 솔직한 이주 후기",
    content: "서울에서 15년간 직장생활을 하다가 번아웃이 와서 강원도 홍천으로 이주한 지 1년이 되었습니다. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일 아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐어요. 특히 텃밭에서 직접 기른 채소로 만든 요리의 맛은 정말 특별합니다. 하지만 겨울철 난방비와 대중교통 불편함은 아직도 적응 중이에요.",
    author: "자연인김씨",
    category: "review",
    location: "강원도 홍천군",
    imageUrl: "/house/house1.jpg",
    views: 1247,
    likes: 89,
    featured: true,
    createdAt: "2024-11-01T09:30:00Z"
  },
  {
    id: 2,
    title: "제주도 카페 창업 성공 스토리",
    content: "제주도로 이주해서 작은 카페를 열었습니다. 처음엔 관광객들만 상대할 줄 알았는데, 현지 주민분들이 더 많이 찾아주셔서 감동받았어요. 제주도만의 특색을 살린 메뉴 개발과 현지 재료 활용이 성공의 열쇠였습니다. 특히 한라봉 라떼와 흑돼지 샌드위치가 인기 메뉴가 되었어요.",
    author: "카페사장",
    category: "story",
    location: "제주도 서귀포시",
    imageUrl: "/house/house5.jpeg",
    views: 892,
    likes: 156,
    featured: true,
    createdAt: "2024-11-05T14:20:00Z"
  },
  {
    id: 3,
    title: "시골 이주 전 꼭 알아야 할 10가지",
    content: "3년 전 경기도에서 전라북도 임실로 이주한 경험을 바탕으로 시골 이주 전 반드시 체크해야 할 사항들을 정리했습니다. 1) 인터넷 속도 확인 2) 의료시설 접근성 3) 교육환경 4) 대중교통 현황 5) 생필품 구매 편의성 6) 지역 커뮤니티 참여 방법 7) 겨울철 난방 대책 8) 농사 관련 정보 9) 지자체 지원 프로그램 10) 이웃과의 관계 형성",
    author: "이주전문가",
    category: "tips",
    location: "전라북도 임실군",
    imageUrl: "/house/house10.jpg",
    views: 2156,
    likes: 234,
    featured: true,
    createdAt: "2024-10-28T11:15:00Z"
  },
  {
    id: 4,
    title: "농촌 빈집 리모델링 완전 가이드",
    content: "100년 된 한옥을 현대적으로 리모델링한 과정을 상세히 공유합니다. 총 예산은 3000만원이 들었고, 6개월의 공사 기간이 소요되었어요. 가장 중요한 건 습기 제거와 단열 작업이었습니다. 전통 미장과 현대식 보일러를 조화롭게 결합해서 겨울에도 따뜻하고 여름에도 시원한 집이 되었어요.",
    author: "리모델링마스터",
    category: "tips",
    location: "경상북도 안동시",
    imageUrl: "/house/house15.jpg",
    views: 1789,
    likes: 198,
    featured: false,
    createdAt: "2024-10-20T16:45:00Z"
  },
  {
    id: 5,
    title: "청년 농업인의 스마트팜 도전기",
    content: "30대에 회사를 그만두고 스마트팜을 시작한 지 2년이 되었습니다. IoT 기술을 활용한 토마토 재배로 연간 3억원의 매출을 올리고 있어요. 초기 투자비용은 크지만, 안정적인 수익과 친환경 농업이라는 만족감이 큽니다. 특히 도시 소비자들과 직접 연결되는 온라인 직판 시스템이 성공 요인이었어요.",
    author: "스마트농부",
    category: "story",
    location: "충청남도 논산시",
    imageUrl: "/house/house20.jpg",
    views: 1456,
    likes: 167,
    featured: false,
    createdAt: "2024-10-15T13:30:00Z"
  },
  {
    id: 6,
    title: "지방 소멸 위기 마을의 희망찾기",
    content: "인구 50명의 작은 마을에 젊은 가족들이 하나둘 이주하면서 생긴 변화들을 소개합니다. 폐교 위기의 초등학교가 다시 문을 열었고, 마을 카페와 공동체 텃밭이 만들어졌어요. 가장 큰 변화는 주민들의 마음가짐이었습니다. 포기했던 마을에 다시 활력이 생기고 있어요.",
    author: "마을이장",
    category: "news",
    location: "경상남도 하동군",
    imageUrl: "/house/house8.jpg",
    views: 987,
    likes: 143,
    featured: true,
    createdAt: "2024-11-10T10:00:00Z"
  }
];
