import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const chatRooms = [
  // 직업별 채팅방
  {
    name: '원격근무러 모임',
    description: '도시를 벗어나 원격으로 일하는 사람들의 정보 공유방',
    category: 'occupation',
    categoryTag: '원격근무',
    icon: '💻',
  },
  {
    name: '귀농 초보 모임',
    description: '귀농을 시작하거나 준비 중인 분들을 위한 채팅방',
    category: 'occupation',
    categoryTag: '귀농',
    icon: '🌾',
  },
  {
    name: '창업가 네트워킹',
    description: '지방에서 새로운 비즈니스를 시작하는 분들의 모임',
    category: 'occupation',
    categoryTag: '창업',
    icon: '🚀',
  },
  {
    name: '은퇴 후 이주',
    description: '제2의 인생을 지방에서 시작하는 분들의 이야기',
    category: 'occupation',
    categoryTag: '은퇴',
    icon: '🏡',
  },
  {
    name: '프리랜서 모임',
    description: '자유롭게 일하며 지방에서 생활하는 프리랜서들의 공간',
    category: 'occupation',
    categoryTag: '프리랜서',
    icon: '✨',
  },

  // 취미별 채팅방
  {
    name: '등산 & 자연 활동',
    description: '등산, 낚시, 캠핑 등 자연을 즐기는 분들의 모임',
    category: 'hobby',
    categoryTag: 'nature-lover',
    icon: '⛰️',
  },
  {
    name: '전통문화 체험',
    description: '전통문화, 박물관, 지역 축제를 즐기는 분들의 공간',
    category: 'hobby',
    categoryTag: 'culture-enthusiast',
    icon: '🎨',
  },
  {
    name: '스포츠 & 운동',
    description: '운동, 자전거, 수영 등 활동적인 취미를 가진 분들',
    category: 'hobby',
    categoryTag: 'sports-fan',
    icon: '🏃',
  },
  {
    name: '텃밭 & 공예',
    description: '도자기, 목공예, 텃밭 가꾸기 등을 즐기는 분들',
    category: 'hobby',
    categoryTag: 'crafts-person',
    icon: '🌱',
  },

  // 지역별 채팅방
  {
    name: '강원도 이주민',
    description: '강원도 지역에 거주하거나 이주를 고민하는 분들',
    category: 'region',
    categoryTag: '강원도',
    icon: '🏔️',
  },
  {
    name: '경상북도 이주민',
    description: '경상북도 지역의 생활과 정보를 나누는 공간',
    category: 'region',
    categoryTag: '경상북도',
    icon: '🌊',
  },
  {
    name: '전라남도 이주민',
    description: '전라남도 지역 커뮤니티',
    category: 'region',
    categoryTag: '전라남도',
    icon: '🌾',
  },
  {
    name: '충청도 이주민',
    description: '충청남/북도 지역 주민들의 소통 공간',
    category: 'region',
    categoryTag: '충청도',
    icon: '🏘️',
  },
  {
    name: '제주도 이주민',
    description: '제주도로의 이주를 꿈꾸거나 거주 중인 분들',
    category: 'region',
    categoryTag: '제주도',
    icon: '🌴',
  },

  // 주제별 채팅방 (추가)
  {
    name: '부동산 정보방',
    description: '지방 부동산 매물, 거래, 시세 정보 공유',
    category: 'topic',
    categoryTag: '부동산',
    icon: '🏠',
  },
  {
    name: '정책 & 지원금',
    description: '귀농귀촌 지원 정책, 보조금 정보 공유',
    category: 'topic',
    categoryTag: '정책',
    icon: '📋',
  },
  {
    name: '자녀 교육',
    description: '지방에서의 자녀 교육, 학교 정보 공유',
    category: 'topic',
    categoryTag: '교육',
    icon: '🎓',
  },
  {
    name: '이웃과 친해지기',
    description: '지역 주민들과 교류하는 방법, 마을 활동 이야기',
    category: 'topic',
    categoryTag: '커뮤니티',
    icon: '🤝',
  },
];

async function main() {
  console.log('🌱 채팅방 시드 데이터 생성 시작...');

  for (const room of chatRooms) {
    // 이미 존재하는지 확인
    const existing = await prisma.chatRoom.findFirst({
      where: {
        category: room.category,
        categoryTag: room.categoryTag,
      },
    });

    if (existing) {
      console.log(`✓ 이미 존재: ${room.name}`);
      continue;
    }

    // 새로 생성
    await prisma.chatRoom.create({
      data: room,
    });

    console.log(`✓ 생성: ${room.name}`);
  }

  console.log('✅ 채팅방 시드 데이터 생성 완료!');
  console.log(`총 ${chatRooms.length}개의 채팅방이 준비되었습니다.`);
}

main()
  .catch((e) => {
    console.error('❌ 시드 실행 중 오류:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
