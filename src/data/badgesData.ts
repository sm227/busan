export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'explorer' | 'social' | 'contributor' | 'achiever';
  conditionType: 'visit_count' | 'guestbook_count' | 'likes_received' | 'likes_given' | 'property_liked';
  conditionValue: number;
}

export const badgesData: BadgeData[] = [
  // Explorer 카테고리
  {
    id: 'first_visit',
    name: '첫 발걸음',
    description: '빈집다방에 첫 방문을 기록했습니다',
    icon: '👋',
    category: 'explorer',
    conditionType: 'visit_count',
    conditionValue: 1
  },
  {
    id: 'explorer_10',
    name: '탐험가',
    description: '10개 이상의 집을 관심목록에 추가했습니다',
    icon: '🗺️',
    category: 'explorer',
    conditionType: 'property_liked',
    conditionValue: 10
  },
  {
    id: 'explorer_50',
    name: '베테랑 탐험가',
    description: '50개 이상의 집을 관심목록에 추가했습니다',
    icon: '🌟',
    category: 'explorer',
    conditionType: 'property_liked',
    conditionValue: 50
  },

  // Social 카테고리
  {
    id: 'first_post',
    name: '첫 이야기',
    description: '첫 번째 방명록을 작성했습니다',
    icon: '✍️',
    category: 'social',
    conditionType: 'guestbook_count',
    conditionValue: 1
  },
  {
    id: 'storyteller',
    name: '이야기꾼',
    description: '10개 이상의 방명록을 작성했습니다',
    icon: '📚',
    category: 'social',
    conditionType: 'guestbook_count',
    conditionValue: 10
  },
  {
    id: 'popular_writer',
    name: '인기 작가',
    description: '작성한 글이 100개 이상의 좋아요를 받았습니다',
    icon: '❤️',
    category: 'social',
    conditionType: 'likes_received',
    conditionValue: 100
  },

  // Contributor 카테고리
  {
    id: 'helper',
    name: '도우미',
    description: '다른 사람의 글에 10개 이상의 좋아요를 눌렀습니다',
    icon: '🤝',
    category: 'contributor',
    conditionType: 'likes_given',
    conditionValue: 10
  },
  {
    id: 'supporter',
    name: '서포터',
    description: '다른 사람의 글에 50개 이상의 좋아요를 눌렀습니다',
    icon: '💪',
    category: 'contributor',
    conditionType: 'likes_given',
    conditionValue: 50
  },

  // Achiever 카테고리
  {
    id: 'active_member',
    name: '활발한 멤버',
    description: '5개 이상의 방명록을 작성하고 20개 이상의 좋아요를 받았습니다',
    icon: '🎯',
    category: 'achiever',
    conditionType: 'guestbook_count',
    conditionValue: 5
  },
  {
    id: 'community_leader',
    name: '커뮤니티 리더',
    description: '20개 이상의 방명록을 작성하고 200개 이상의 좋아요를 받았습니다',
    icon: '👑',
    category: 'achiever',
    conditionType: 'guestbook_count',
    conditionValue: 20
  }
];
