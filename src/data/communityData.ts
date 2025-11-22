export const communityData = [
  {
    id: 1,
    title: '강원도 홍천 1년 살이 솔직 후기',
    content: '서울에서 15년간 직장생활을 하다가 번아웃이 와서 강원도 홍천으로 이주한 지 1년이 되었습니다. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일 아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐어요. 특히 텃밭에서 직접 기른 채소로 만든 요리의 맛은 정말 특별합니다. 하지만 겨울철 난방비와 대중교통 불편함은 아직도 적응 중이에요. 그래도 도시의 스트레스에서 벗어나 자연과 함께하는 삶이 주는 평화로움은 무엇과도 바꿀 수 없다고 생각합니다.',
    location: '강원도 홍천군',
    rating: 4,
    category: 'experience' as const,
    tags: ['이주후기', '강원도', '시골생활', '자연'],
    likes_count: 24,
    comments_count: 8,
    created_at: '2024-11-15T09:30:00Z',
    author_nickname: '자연인김씨',
    user_id: 1
  },
  {
    id: 2,
    title: '제주도에서 카페 창업한 이야기',
    content: '제주도로 이주해서 작은 카페를 열었습니다. 처음엔 관광객들만 상대할 줄 알았는데, 현지 주민분들이 더 많이 찾아주셔서 감동받았어요. 제주도만의 특색을 살린 메뉴 개발과 현지 재료 활용이 성공의 열쇠였습니다. 특히 한라봉 라떼와 흑돼지 샌드위치가 인기 메뉴가 되었어요. 창업 초기엔 힘들었지만 지금은 안정적인 수익을 내고 있습니다.',
    location: '제주도 서귀포시',
    rating: 5,
    category: 'experience' as const,
    tags: ['창업', '제주도', '카페', '성공스토리'],
    likes_count: 31,
    comments_count: 12,
    created_at: '2024-11-18T14:20:00Z',
    author_nickname: '카페사장',
    user_id: 2
  },
  {
    id: 3,
    title: '시골 이주 전 꼭 알아야 할 체크리스트',
    content: '3년 전 경기도에서 전라북도 임실로 이주한 경험을 바탕으로 시골 이주 전 반드시 체크해야 할 사항들을 정리했습니다. 1) 인터넷 속도 확인 2) 의료시설 접근성 3) 교육환경 4) 대중교통 현황 5) 생필품 구매 편의성 6) 지역 커뮤니티 참여 방법 7) 겨울철 난방 대책 8) 농사 관련 정보 9) 지자체 지원 프로그램 10) 이웃과의 관계 형성. 이 중에서도 특히 겨울 난방과 의료시설 접근성은 정말 중요해요!',
    location: '전라북도 임실군',
    rating: undefined,
    category: 'tip' as const,
    tags: ['이주팁', '체크리스트', '준비사항'],
    likes_count: 45,
    comments_count: 15,
    created_at: '2024-11-10T11:15:00Z',
    author_nickname: '이주전문가',
    user_id: 3
  },
  {
    id: 4,
    title: '30대 회사원의 스마트팜 도전기',
    content: '30대에 회사를 그만두고 스마트팜을 시작한 지 2년이 되었습니다. IoT 기술을 활용한 토마토 재배로 연간 3억원의 매출을 올리고 있어요. 초기 투자비용은 크지만, 안정적인 수익과 친환경 농업이라는 만족감이 큽니다. 특히 도시 소비자들과 직접 연결되는 온라인 직판 시스템이 성공 요인이었어요. 기술과 농업의 결합이 미래라고 확신합니다.',
    location: '충청남도 논산시',
    rating: 5,
    category: 'experience' as const,
    tags: ['스마트팜', '농업', '창업', '기술농업'],
    likes_count: 38,
    comments_count: 9,
    created_at: '2024-11-12T16:45:00Z',
    author_nickname: '스마트농부',
    user_id: 4
  },
  {
    id: 5,
    title: '소멸위기 마을에 찾아온 희망',
    content: '인구 50명의 작은 마을에 젊은 가족들이 하나둘 이주하면서 생긴 변화들을 소개합니다. 폐교 위기의 초등학교가 다시 문을 열었고, 마을 카페와 공동체 텃밭이 만들어졌어요. 가장 큰 변화는 주민들의 마음가짐이었습니다. 포기했던 마을에 다시 활력이 생기고 있어요. 젊은 분들이 오시면서 디지털 기술도 도입되고, 농산물 온라인 판매도 시작했습니다.',
    location: '경상남도 하동군',
    rating: undefined,
    category: 'review' as const,
    tags: ['마을부활', '지역활성화', '공동체'],
    likes_count: 19,
    comments_count: 6,
    created_at: '2024-11-20T10:00:00Z',
    author_nickname: '마을이장',
    user_id: 5
  },
  {
    id: 6,
    title: '도시인을 위한 농사 초보 가이드',
    content: '농사 완전 초보였던 제가 1년 동안 텃밭을 가꾸면서 배운 것들을 공유합니다. 첫해에는 실패가 많았어요. 물 주기, 병충해 관리, 수확 시기 등 모든 게 어려웠습니다. 하지만 이웃 어르신들의 도움과 유튜브 강의를 통해 점점 나아졌어요. 지금은 상추, 무, 배추 정도는 자급자족할 수 있게 되었습니다. 가장 중요한 건 욕심부리지 말고 작은 것부터 시작하는 거예요.',
    location: '강원도 홍천군',
    rating: undefined,
    category: 'tip' as const,
    tags: ['농사초보', '텃밭', '자급자족', '농사팁'],
    likes_count: 27,
    comments_count: 11,
    created_at: '2024-11-08T13:30:00Z',
    author_nickname: '자연인김씨',
    user_id: 1
  },
  {
    id: 7,
    title: '귀촌 1년차, 겨울나기 준비 어떻게 하셨나요?',
    content: '올해 봄에 귀촌해서 처음으로 시골에서 겨울을 보내게 됩니다. 난방비가 걱정되는데, 선배 귀촌러분들은 어떻게 준비하셨나요? 보일러 외에 추가 난방 기구가 필요한지, 단열 작업은 어떻게 하는 게 좋은지 조언 부탁드립니다!',
    location: '강원도 평창군',
    rating: undefined,
    category: 'question' as const,
    tags: ['겨울준비', '난방', '귀촌생활', '질문'],
    likes_count: 8,
    comments_count: 23,
    created_at: '2024-11-21T08:15:00Z',
    author_nickname: '겨울걱정',
    user_id: 6
  },
  {
    id: 8,
    title: '전라남도 보성, 녹차밭 근처 한옥 생활 후기',
    content: '보성 녹차밭 근처에서 한옥을 임대해서 살고 있습니다. 아침마다 녹차밭을 산책하는 게 일상이 되었어요. 관광객이 많은 봄~가을엔 시끌벅적하지만, 겨울엔 정말 조용하고 평화롭습니다. 한옥 생활이 처음엔 불편했는데, 지금은 온돌의 따스함과 마루의 시원함이 너무 좋아요.',
    location: '전라남도 보성군',
    rating: 4,
    category: 'review' as const,
    tags: ['보성', '한옥', '녹차밭', '전라남도'],
    likes_count: 16,
    comments_count: 5,
    created_at: '2024-11-17T15:30:00Z',
    author_nickname: '녹차러버',
    user_id: 7
  },
  {
    id: 9,
    title: '시골에서 재택근무, 인터넷 속도 체크는 필수!',
    content: '재택근무자로서 시골 이주를 고려하시는 분들께 꼭 드리고 싶은 말이 있어요. 인터넷 속도를 미리 확인하세요! 저는 확인 안 하고 이주했다가 큰 낭패를 봤습니다. 다행히 KT 인터넷이 들어오는 지역이라 지금은 괜찮지만, 일부 지역은 정말 느려요. 계약 전에 꼭 현지에서 속도 테스트 해보시길!',
    location: '경기도 양평군',
    rating: undefined,
    category: 'tip' as const,
    tags: ['재택근무', '인터넷', '꿀팁', '이주팁'],
    likes_count: 34,
    comments_count: 18,
    created_at: '2024-11-14T12:00:00Z',
    author_nickname: '리모트워커',
    user_id: 8
  },
  {
    id: 10,
    title: '충청북도 옥천, 귀농 3년차 현실 조언',
    content: '귀농 3년차입니다. 솔직히 말씀드리면, 처음 1년은 정말 힘들었어요. 농사 실패, 이웃과의 소통 어려움, 외로움 등... 하지만 2년차부터는 조금씩 나아졌고, 지금은 적응했습니다. 귀농을 꿈꾸시는 분들께 조언하자면: 1) 최소 1년치 생활비는 준비하세요 2) 농사는 처음엔 작게 시작 3) 지역 어르신들께 배우는 자세 4) 너무 이상적으로 생각하지 마세요.',
    location: '충청북도 옥천군',
    rating: 3,
    category: 'review' as const,
    tags: ['귀농', '현실조언', '3년차', '충북'],
    likes_count: 52,
    comments_count: 21,
    created_at: '2024-11-05T09:45:00Z',
    author_nickname: '현실농부',
    user_id: 9
  }
];

export interface CommunityEntry {
  id: number;
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question';
  property_id?: string;
  tags?: string | string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_nickname: string;
  user_id: number;
}
