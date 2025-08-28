import Database from 'better-sqlite3';
import path from 'path';
import * as fs from "node:fs";

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'data', 'app.db');

// 데이터베이스 인스턴스
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    //디렉토리가 없다면 자동 생성
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new Database(dbPath);
    
    // WAL 모드로 설정 (성능 향상)
    db.pragma('journal_mode = WAL');
    
    // 외래 키 제약 조건 활성화
    db.pragma('foreign_keys = ON');
    
    // 테이블 생성
    initializeTables();
  }
  
  return db;
}

function initializeTables() {
  if (!db) return;
  
  // 사용자 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nickname TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 설문 결과 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS survey_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      living_style TEXT NOT NULL,
      social_style TEXT NOT NULL,
      work_style TEXT NOT NULL,
      hobby_style TEXT NOT NULL,
      pace TEXT NOT NULL,
      budget TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 관심목록 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      property_id TEXT NOT NULL,
      property_title TEXT NOT NULL,
      property_location TEXT NOT NULL,
      property_price INTEGER,
      match_score INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      UNIQUE(user_id, property_id)
    )
  `);
  
  // 외래 키 참조 테이블들을 먼저 삭제 (중복 방지)
  db.exec(`DROP TABLE IF EXISTS comment_likes`);
  db.exec(`DROP TABLE IF EXISTS comments`);
  db.exec(`DROP TABLE IF EXISTS bookmarks`);
  db.exec(`DROP TABLE IF EXISTS guestbook_likes`);
  db.exec(`DROP TABLE IF EXISTS guestbook`);
  
  // 방명록 테이블
  db.exec(`
    CREATE TABLE guestbook (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      location TEXT,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      category TEXT CHECK(category IN ('experience', 'review', 'tip', 'question')),
      property_id TEXT,
      tags TEXT,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // 방명록 좋아요 추적 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS guestbook_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      guestbook_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (guestbook_id) REFERENCES guestbook (id),
      UNIQUE(user_id, guestbook_id)
    )
  `);

  // 댓글 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      guestbook_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      parent_id INTEGER,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (guestbook_id) REFERENCES guestbook (id),
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (parent_id) REFERENCES comments (id)
    )
  `);

  // 댓글 좋아요 테이블
  db.exec(`
    CREATE TABLE comment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      comment_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (comment_id) REFERENCES comments (id),
      UNIQUE(user_id, comment_id)
    )
  `);

  // 북마크 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      guestbook_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (guestbook_id) REFERENCES guestbook (id),
      UNIQUE(user_id, guestbook_id)
    )
  `);
  
  // 뱃지 정의 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT CHECK(category IN ('explorer', 'social', 'contributor', 'achiever')) NOT NULL,
      condition_type TEXT CHECK(condition_type IN ('guestbook_count', 'likes_received', 'likes_given', 'visit_count', 'property_liked')) NOT NULL,
      condition_value INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 사용자 뱃지 획득 기록 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id TEXT NOT NULL,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (badge_id) REFERENCES badges (id),
      UNIQUE(user_id, badge_id)
    )
  `);
  
  // 기존 popular_posts 테이블이 있으면 삭제하고 다시 생성 (BOOLEAN -> INTEGER 변환)
  db.exec(`DROP TABLE IF EXISTS popular_posts`);
  
  // 인기 게시글 테이블
  db.exec(`
    CREATE TABLE popular_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT CHECK(category IN ('review', 'tips', 'story', 'news')) NOT NULL,
      location TEXT,
      image_url TEXT,
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
    CREATE INDEX IF NOT EXISTS idx_survey_results_user_id ON survey_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_property_id ON user_likes(property_id);
    CREATE INDEX IF NOT EXISTS idx_guestbook_user_id ON guestbook(user_id);
    CREATE INDEX IF NOT EXISTS idx_guestbook_category ON guestbook(category);
    CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at);
    CREATE INDEX IF NOT EXISTS idx_guestbook_likes_user_id ON guestbook_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_guestbook_likes_guestbook_id ON guestbook_likes(guestbook_id);
    CREATE INDEX IF NOT EXISTS idx_comments_guestbook_id ON comments(guestbook_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
    CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
    CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
    CREATE INDEX IF NOT EXISTS idx_badges_condition_type ON badges(condition_type);
    CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
    CREATE INDEX IF NOT EXISTS idx_popular_posts_category ON popular_posts(category);
    CREATE INDEX IF NOT EXISTS idx_popular_posts_featured ON popular_posts(featured);
    CREATE INDEX IF NOT EXISTS idx_popular_posts_likes ON popular_posts(likes);
    CREATE INDEX IF NOT EXISTS idx_popular_posts_views ON popular_posts(views);
    CREATE INDEX IF NOT EXISTS idx_popular_posts_created_at ON popular_posts(created_at);
  `);
  
  // 기본 뱃지 데이터 삽입
  initializeBadges();
  
  // 기본 인기 게시글 데이터 삽입
  initializePopularPosts();
  
  // 기본 방명록 데이터 삽입
  initializeGuestbookData();
}

// 기본 뱃지 데이터 초기화
function initializeBadges() {
  if (!db) return;
  
  const badges = [
    // Explorer 카테고리
    {
      id: 'first_visit',
      name: '첫 발걸음',
      description: '빈집다방에 첫 방문을 기록했습니다',
      icon: '👋',
      category: 'explorer',
      condition_type: 'visit_count',
      condition_value: 1
    },
    {
      id: 'explorer_10',
      name: '탐험가',
      description: '10개 이상의 집을 관심목록에 추가했습니다',
      icon: '🗺️',
      category: 'explorer', 
      condition_type: 'property_liked',
      condition_value: 10
    },
    {
      id: 'explorer_50',
      name: '베테랑 탐험가',
      description: '50개 이상의 집을 관심목록에 추가했습니다',
      icon: '🌟',
      category: 'explorer',
      condition_type: 'property_liked',
      condition_value: 50
    },
    
    // Social 카테고리
    {
      id: 'first_post',
      name: '첫 이야기',
      description: '첫 번째 방명록을 작성했습니다',
      icon: '✍️',
      category: 'social',
      condition_type: 'guestbook_count',
      condition_value: 1
    },
    {
      id: 'storyteller',
      name: '이야기꾼',
      description: '10개 이상의 방명록을 작성했습니다',
      icon: '📚',
      category: 'social',
      condition_type: 'guestbook_count',
      condition_value: 10
    },
    {
      id: 'popular_writer',
      name: '인기 작가',
      description: '작성한 글이 100개 이상의 좋아요를 받았습니다',
      icon: '❤️',
      category: 'social',
      condition_type: 'likes_received',
      condition_value: 100
    },
    
    // Contributor 카테고리
    {
      id: 'helper',
      name: '도우미',
      description: '다른 사람의 글에 10개 이상의 좋아요를 눌렀습니다',
      icon: '🤝',
      category: 'contributor',
      condition_type: 'likes_given',
      condition_value: 10
    },
    {
      id: 'supporter',
      name: '서포터',
      description: '다른 사람의 글에 50개 이상의 좋아요를 눌렀습니다',
      icon: '💪',
      category: 'contributor',
      condition_type: 'likes_given',
      condition_value: 50
    },
    
    // Achiever 카테고리
    {
      id: 'active_member',
      name: '활발한 멤버',
      description: '5개 이상의 방명록을 작성하고 20개 이상의 좋아요를 받았습니다',
      icon: '🎯',
      category: 'achiever',
      condition_type: 'guestbook_count',
      condition_value: 5
    },
    {
      id: 'community_leader',
      name: '커뮤니티 리더',
      description: '20개 이상의 방명록을 작성하고 200개 이상의 좋아요를 받았습니다',
      icon: '👑',
      category: 'achiever',
      condition_type: 'guestbook_count',
      condition_value: 20
    }
  ];
  
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO badges (id, name, description, icon, category, condition_type, condition_value)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const insertTransaction = db.transaction((badges) => {
      for (const badge of badges) {
        insertStmt.run(
          badge.id,
          badge.name,
          badge.description,
          badge.icon,
          badge.category,
          badge.condition_type,
          badge.condition_value
        );
      }
    });
    
    insertTransaction(badges);
  } catch (error) {
    console.error('기본 뱃지 데이터 삽입 실패:', error);
  }
}

// 기본 인기 게시글 데이터 초기화
function initializePopularPosts() {
  if (!db) return;
  
  const posts = [
    {
      title: "강원도 홍천에서의 1년, 솔직한 이주 후기",
      content: "서울에서 15년간 직장생활을 하다가 번아웃이 와서 강원도 홍천으로 이주한 지 1년이 되었습니다. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일 아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐어요. 특히 텃밭에서 직접 기른 채소로 만든 요리의 맛은 정말 특별합니다. 하지만 겨울철 난방비와 대중교통 불편함은 아직도 적응 중이에요.",
      author: "자연인김씨",
      category: "review",
      location: "강원도 홍천군",
      image_url: "/house/house1.jpg",
      views: 1247,
      likes: 89,
      featured: true
    },
    {
      title: "제주도 카페 창업 성공 스토리",
      content: "제주도로 이주해서 작은 카페를 열었습니다. 처음엔 관광객들만 상대할 줄 알았는데, 현지 주민분들이 더 많이 찾아주셔서 감동받았어요. 제주도만의 특색을 살린 메뉴 개발과 현지 재료 활용이 성공의 열쇠였습니다. 특히 한라봉 라떼와 흑돼지 샌드위치가 인기 메뉴가 되었어요.",
      author: "카페사장",
      category: "story",
      location: "제주도 서귀포시",
      image_url: "/house/house5.jpeg",
      views: 892,
      likes: 156,
      featured: true
    },
    {
      title: "시골 이주 전 꼭 알아야 할 10가지",
      content: "3년 전 경기도에서 전라북도 임실로 이주한 경험을 바탕으로 시골 이주 전 반드시 체크해야 할 사항들을 정리했습니다. 1) 인터넷 속도 확인 2) 의료시설 접근성 3) 교육환경 4) 대중교통 현황 5) 생필품 구매 편의성 6) 지역 커뮤니티 참여 방법 7) 겨울철 난방 대책 8) 농사 관련 정보 9) 지자체 지원 프로그램 10) 이웃과의 관계 형성",
      author: "이주전문가",
      category: "tips",
      location: "전라북도 임실군",
      image_url: "/house/house10.jpg",
      views: 2156,
      likes: 234,
      featured: true
    },
    {
      title: "농촌 빈집 리모델링 완전 가이드",
      content: "100년 된 한옥을 현대적으로 리모델링한 과정을 상세히 공유합니다. 총 예산은 3000만원이 들었고, 6개월의 공사 기간이 소요되었어요. 가장 중요한 건 습기 제거와 단열 작업이었습니다. 전통 미장과 현대식 보일러를 조화롭게 결합해서 겨울에도 따뜻하고 여름에도 시원한 집이 되었어요.",
      author: "리모델링마스터",
      category: "tips",
      location: "경상북도 안동시",
      image_url: "/house/house15.jpg",
      views: 1789,
      likes: 198,
      featured: false
    },
    {
      title: "청년 농업인의 스마트팜 도전기",
      content: "30대에 회사를 그만두고 스마트팜을 시작한 지 2년이 되었습니다. IoT 기술을 활용한 토마토 재배로 연간 3억원의 매출을 올리고 있어요. 초기 투자비용은 크지만, 안정적인 수익과 친환경 농업이라는 만족감이 큽니다. 특히 도시 소비자들과 직접 연결되는 온라인 직판 시스템이 성공 요인이었어요.",
      author: "스마트농부",
      category: "story",
      location: "충청남도 논산시",
      image_url: "/house/house20.jpg",
      views: 1456,
      likes: 167,
      featured: false
    },
    {
      title: "지방 소멸 위기 마을의 희망찾기",
      content: "인구 50명의 작은 마을에 젊은 가족들이 하나둘 이주하면서 생긴 변화들을 소개합니다. 폐교 위기의 초등학교가 다시 문을 열었고, 마을 카페와 공동체 텃밭이 만들어졌어요. 가장 큰 변화는 주민들의 마음가짐이었습니다. 포기했던 마을에 다시 활력이 생기고 있어요.",
      author: "마을이장",
      category: "news",
      location: "경상남도 하동군",
      image_url: "/house/house8.jpg",
      views: 987,
      likes: 143,
      featured: true
    }
  ];
  
  const insertStmt = db.prepare(`
    INSERT OR REPLACE INTO popular_posts (id, title, content, author, category, location, image_url, views, likes, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const insertTransaction = db.transaction((posts: any[]) => {
      posts.forEach((post: any, index: number) => {
        insertStmt.run(
          index + 1,
          post.title,
          post.content,
          post.author,
          post.category,
          post.location,
          post.image_url,
          post.views,
          post.likes,
          post.featured ? 1 : 0  // 불린을 정수로 변환
        );
      });
    });
    
    insertTransaction(posts);
  } catch (error) {
    console.error('기본 인기 게시글 데이터 삽입 실패:', error);
  }
}

// 기본 방명록 데이터 초기화
function initializeGuestbookData() {
  if (!db) return;
  
  // 먼저 샘플 사용자들을 생성
  const sampleUsers = [
    { nickname: '자연인김씨', password: 'sample123' },
    { nickname: '카페사장', password: 'sample123' },
    { nickname: '이주전문가', password: 'sample123' },
    { nickname: '스마트농부', password: 'sample123' },
    { nickname: '마을이장', password: 'sample123' }
  ];
  
  const userInsertStmt = db.prepare(`
    INSERT OR IGNORE INTO users (nickname, password)
    VALUES (?, ?)
  `);
  
  // 사용자 데이터 삽입
  try {
    sampleUsers.forEach(user => {
      userInsertStmt.run(user.nickname, user.password);
    });
  } catch (error) {
    console.error('샘플 사용자 생성 실패:', error);
  }
  
  // 방명록 데이터
  const guestbookEntries = [
    {
      user_nickname: '자연인김씨',
      title: '강원도 홍천 1년 살이 솔직 후기',
      content: '서울에서 15년간 직장생활을 하다가 번아웃이 와서 강원도 홍천으로 이주한 지 1년이 되었습니다. 처음엔 모든 게 낯설고 어려웠지만, 지금은 매일 아침 산새 소리에 눈을 뜨는 게 이렇게 행복할 줄 몰랐어요. 특히 텃밭에서 직접 기른 채소로 만든 요리의 맛은 정말 특별합니다. 하지만 겨울철 난방비와 대중교통 불편함은 아직도 적응 중이에요. 그래도 도시의 스트레스에서 벗어나 자연과 함께하는 삶이 주는 평화로움은 무엇과도 바꿀 수 없다고 생각합니다.',
      location: '강원도 홍천군',
      rating: 4,
      category: 'experience',
      tags: '["이주후기", "강원도", "시골생활", "자연"]',
      likes_count: 24
    },
    {
      user_nickname: '카페사장',
      title: '제주도에서 카페 창업한 이야기',
      content: '제주도로 이주해서 작은 카페를 열었습니다. 처음엔 관광객들만 상대할 줄 알았는데, 현지 주민분들이 더 많이 찾아주셔서 감동받았어요. 제주도만의 특색을 살린 메뉴 개발과 현지 재료 활용이 성공의 열쇠였습니다. 특히 한라봉 라떼와 흑돼지 샌드위치가 인기 메뉴가 되었어요. 창업 초기엔 힘들었지만 지금은 안정적인 수익을 내고 있습니다.',
      location: '제주도 서귀포시',
      rating: 5,
      category: 'experience',
      tags: '["창업", "제주도", "카페", "성공스토리"]',
      likes_count: 31
    },
    {
      user_nickname: '이주전문가',
      title: '시골 이주 전 꼭 알아야 할 체크리스트',
      content: '3년 전 경기도에서 전라북도 임실로 이주한 경험을 바탕으로 시골 이주 전 반드시 체크해야 할 사항들을 정리했습니다. 1) 인터넷 속도 확인 2) 의료시설 접근성 3) 교육환경 4) 대중교통 현황 5) 생필품 구매 편의성 6) 지역 커뮤니티 참여 방법 7) 겨울철 난방 대책 8) 농사 관련 정보 9) 지자체 지원 프로그램 10) 이웃과의 관계 형성. 이 중에서도 특히 겨울 난방과 의료시설 접근성은 정말 중요해요!',
      location: '전라북도 임실군',
      rating: null,
      category: 'tip',
      tags: '["이주팁", "체크리스트", "준비사항"]',
      likes_count: 45
    },
    {
      user_nickname: '스마트농부',
      title: '30대 회사원의 스마트팜 도전기',
      content: '30대에 회사를 그만두고 스마트팜을 시작한 지 2년이 되었습니다. IoT 기술을 활용한 토마토 재배로 연간 3억원의 매출을 올리고 있어요. 초기 투자비용은 크지만, 안정적인 수익과 친환경 농업이라는 만족감이 큽니다. 특히 도시 소비자들과 직접 연결되는 온라인 직판 시스템이 성공 요인이었어요. 기술과 농업의 결합이 미래라고 확신합니다.',
      location: '충청남도 논산시',
      rating: 5,
      category: 'experience',
      tags: '["스마트팜", "농업", "창업", "기술농업"]',
      likes_count: 38
    },
    {
      user_nickname: '마을이장',
      title: '소멸위기 마을에 찾아온 희망',
      content: '인구 50명의 작은 마을에 젊은 가족들이 하나둘 이주하면서 생긴 변화들을 소개합니다. 폐교 위기의 초등학교가 다시 문을 열었고, 마을 카페와 공동체 텃밭이 만들어졌어요. 가장 큰 변화는 주민들의 마음가짐이었습니다. 포기했던 마을에 다시 활력이 생기고 있어요. 젊은 분들이 오시면서 디지털 기술도 도입되고, 농산물 온라인 판매도 시작했습니다.',
      location: '경상남도 하동군',
      rating: null,
      category: 'review',
      tags: '["마을부활", "지역활성화", "공동체"]',
      likes_count: 19
    },
    {
      user_nickname: '자연인김씨',
      title: '도시인을 위한 농사 초보 가이드',
      content: '농사 완전 초보였던 제가 1년 동안 텃밭을 가꾸면서 배운 것들을 공유합니다. 첫해에는 실패가 많았어요. 물 주기, 병충해 관리, 수확 시기 등 모든 게 어려웠습니다. 하지만 이웃 어르신들의 도움과 유튜브 강의를 통해 점점 나아졌어요. 지금은 상추, 무, 배추 정도는 자급자족할 수 있게 되었습니다. 가장 중요한 건 욕심부리지 말고 작은 것부터 시작하는 거예요.',
      location: '강원도 홍천군',
      rating: null,
      category: 'tip',
      tags: '["농사초보", "텃밭", "자급자족", "농사팁"]',
      likes_count: 27
    }
  ];
  


  // 사용자 ID 매핑을 위한 조회
  const getUserIdStmt = db.prepare(`SELECT id FROM users WHERE nickname = ?`);
  const insertGuestbookStmt = db.prepare(`
    INSERT INTO guestbook (
      user_id, title, content, location, rating, category, tags, likes_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const insertTransaction = db.transaction(() => {
      guestbookEntries.forEach(entry => {
        const user = getUserIdStmt.get(entry.user_nickname) as any;
        if (user) {
          insertGuestbookStmt.run(
            user.id,
            entry.title,
            entry.content,
            entry.location,
            entry.rating,
            entry.category,
            entry.tags,
            entry.likes_count
          );
        }
      });
    });
    
    insertTransaction();
  } catch (error) {
    console.error('기본 방명록 데이터 삽입 실패:', error);
  }
}

// 사용자 생성
export function createUser(nickname: string, password: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO users (nickname, password)
    VALUES (?, ?)
  `);
  
  try {
    const result = stmt.run(nickname, password);
    const userId = result.lastInsertRowid as number;
    
    // 첫 방문 뱃지 자동 지급
    setTimeout(() => {
      checkAndAwardBadges(userId);
    }, 100);
    
    return { success: true, userId };
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: '이미 사용 중인 닉네임입니다.' };
    }
    return { success: false, error: '사용자 생성에 실패했습니다.' };
  }
}

// 사용자 인증
export function authenticateUser(nickname: string, password: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id, nickname FROM users 
    WHERE nickname = ? AND password = ?
  `);
  
  const user = stmt.get(nickname, password);
  return user ? { success: true, user } : { success: false };
}

// 설문 결과 저장
export function saveSurveyResult(userId: number, preferences: {
  livingStyle: string;
  socialStyle: string;
  workStyle: string;
  hobbyStyle: string;
  pace: string;
  budget: string;
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO survey_results (
      user_id, living_style, social_style, work_style, 
      hobby_style, pace, budget
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(
      userId,
      preferences.livingStyle,
      preferences.socialStyle,
      preferences.workStyle,
      preferences.hobbyStyle,
      preferences.pace,
      preferences.budget
    );
    return { success: true, surveyId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: '설문 결과 저장에 실패했습니다.' };
  }
}

// 사용자의 설문 결과 조회
export function getUserSurveyResult(userId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM survey_results 
    WHERE user_id = ? 
    ORDER BY created_at DESC 
    LIMIT 1
  `);
  
  return stmt.get(userId);
}

// 사용자 관심목록에 속성 추가
export function saveUserLike(userId: number, property: {
  id: string;
  title: string;
  location: string;
  price: number;
  matchScore: number;
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO user_likes (
      user_id, property_id, property_title, property_location, 
      property_price, match_score
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(
      userId,
      property.id,
      property.title,
      property.location,
      property.price,
      property.matchScore
    );
    
    // 뱃지 조건 확인 (비동기)
    setTimeout(() => {
      checkAndAwardBadges(userId);
    }, 100);
    
    return { success: true, likeId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: '관심목록 저장에 실패했습니다.' };
  }
}

// 사용자 관심목록에서 속성 제거
export function removeUserLike(userId: number, propertyId: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    DELETE FROM user_likes 
    WHERE user_id = ? AND property_id = ?
  `);
  
  try {
    const result = stmt.run(userId, propertyId);
    return { success: true, changes: result.changes };
  } catch (error) {
    return { success: false, error: '관심목록 삭제에 실패했습니다.' };
  }
}

// 사용자의 모든 관심목록 조회
export function getUserLikes(userId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM user_likes 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `);
  
  try {
    return stmt.all(userId);
  } catch (error) {
    return [];
  }
}

// 사용자가 특정 속성을 좋아하는지 확인
export function checkUserLike(userId: number, propertyId: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id FROM user_likes 
    WHERE user_id = ? AND property_id = ?
  `);
  
  const result = stmt.get(userId, propertyId);
  return !!result;
}

// 방명록 글 작성
export function createGuestbookEntry(userId: number, entry: {
  title: string;
  content: string;
  location?: string;
  rating?: number;
  category: 'experience' | 'review' | 'tip' | 'question';
  propertyId?: string;
  tags?: string[];
}) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO guestbook (
      user_id, title, content, location, rating, category, 
      property_id, tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(
      userId,
      entry.title,
      entry.content,
      entry.location || null,
      entry.rating || null,
      entry.category,
      entry.propertyId || null,
      entry.tags ? JSON.stringify(entry.tags) : null
    );
    
    // 뱃지 조건 확인 (비동기)
    setTimeout(() => {
      checkAndAwardBadges(userId);
    }, 100);
    
    return { success: true, entryId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: '방명록 작성에 실패했습니다.' };
  }
}

// 방명록 목록 조회
interface GuestbookFilters {
  search?: string;
  category?: string;
  location?: string;
  tag?: string;
  minRating?: number;
  sortBy?: 'created_at' | 'likes_count' | 'rating' | 'comments_count' | 'latest_comment';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export function getGuestbookEntries(filters: GuestbookFilters = {}) {
  const db = getDatabase();
  
  let query = `
    SELECT g.*, u.nickname as author_nickname,
           (SELECT COUNT(*) FROM comments c WHERE c.guestbook_id = g.id) as comments_count
    FROM guestbook g
    JOIN users u ON g.user_id = u.id
    WHERE 1=1
  `;
  
  const params: any[] = [];
  
  // 검색 필터
  if (filters.search) {
    query += ` AND (g.title LIKE ? OR g.content LIKE ? OR u.nickname LIKE ?)`;
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }
  
  // 카테고리 필터
  if (filters.category) {
    query += ` AND g.category = ?`;
    params.push(filters.category);
  }
  
  // 지역 필터
  if (filters.location) {
    query += ` AND g.location LIKE ?`;
    params.push(`%${filters.location}%`);
  }
  
  // 태그 필터
  if (filters.tag) {
    query += ` AND g.tags LIKE ?`;
    params.push(`%"${filters.tag}"%`);
  }
  
  // 평점 필터
  if (filters.minRating) {
    query += ` AND g.rating >= ?`;
    params.push(filters.minRating);
  }
  
  // 정렬
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'DESC';
  
  let orderClause = '';
  switch (sortBy) {
    case 'likes_count':
      orderClause = `ORDER BY g.likes_count ${sortOrder}`;
      break;
    case 'comments_count':
      orderClause = `ORDER BY comments_count ${sortOrder}`;
      break;
    case 'latest_comment':
      // 최신 댓글순 정렬
      query = `
        SELECT g.*, u.nickname as author_nickname,
               (SELECT COUNT(*) FROM comments c WHERE c.guestbook_id = g.id) as comments_count,
               (SELECT MAX(c.created_at) FROM comments c WHERE c.guestbook_id = g.id) as latest_comment_at
        FROM guestbook g
        JOIN users u ON g.user_id = u.id
        WHERE 1=1
      `;
      
      // 필터 조건들을 다시 추가
      if (filters.search) {
        query += ` AND (g.title LIKE ? OR g.content LIKE ? OR u.nickname LIKE ?)`;
      }
      if (filters.category) {
        query += ` AND g.category = ?`;
      }
      if (filters.location) {
        query += ` AND g.location LIKE ?`;
      }
      if (filters.tag) {
        query += ` AND g.tags LIKE ?`;
      }
      if (filters.minRating) {
        query += ` AND g.rating >= ?`;
      }
      
      orderClause = `ORDER BY latest_comment_at ${sortOrder} NULLS LAST, g.created_at ${sortOrder}`;
      break;
    case 'rating':
      orderClause = `ORDER BY g.rating ${sortOrder} NULLS LAST, g.created_at ${sortOrder}`;
      break;
    default:
      orderClause = `ORDER BY g.${sortBy} ${sortOrder}`;
  }
  
  query += ` ${orderClause}`;
  
  // 페이지네이션
  if (filters.limit) {
    query += ` LIMIT ?`;
    params.push(filters.limit);
    
    if (filters.offset) {
      query += ` OFFSET ?`;
      params.push(filters.offset);
    }
  }
  
  const stmt = db.prepare(query);
  
  try {
    const entries = stmt.all(...params);
    return entries.map((entry: any) => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));
  } catch (error) {
    console.error('방명록 조회 실패:', error);
    return [];
  }
}

// 댓글 관련 함수들
export function getComments(guestbookId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT c.*, u.nickname as author_nickname,
           (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as likes_count
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.guestbook_id = ?
    ORDER BY 
      CASE WHEN c.parent_id IS NULL THEN c.id ELSE c.parent_id END,
      c.parent_id IS NULL DESC,
      c.created_at ASC
  `);
  
  try {
    const result = stmt.all(guestbookId);
    console.log(`댓글 조회 결과 (guestbookId: ${guestbookId}):`, result);
    return result;
  } catch (error) {
    console.error('댓글 조회 실패:', error);
    return [];
  }
}

export function createComment(guestbookId: number, userId: number, content: string, parentId?: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    INSERT INTO comments (guestbook_id, user_id, content, parent_id)
    VALUES (?, ?, ?, ?)
  `);
  
  try {
    const result = stmt.run(guestbookId, userId, content, parentId || null);
    return { success: true, id: result.lastInsertRowid };
  } catch (error) {
    console.error('댓글 작성 실패:', error);
    return { success: false, error: '댓글 작성에 실패했습니다.' };
  }
}

export function updateComment(commentId: number, userId: number, content: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE comments 
    SET content = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);
  
  try {
    const result = stmt.run(content, commentId, userId);
    return { success: result.changes > 0 };
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    return { success: false, error: '댓글 수정에 실패했습니다.' };
  }
}

export function deleteComment(commentId: number, userId: number) {
  const db = getDatabase();
  
  try {
    const transaction = db.transaction(() => {
      // 대댓글이 있는지 확인
      const childCommentsStmt = db.prepare(`
        SELECT COUNT(*) as count FROM comments WHERE parent_id = ?
      `);
      const childCount = childCommentsStmt.get(commentId) as { count: number };
      
      if (childCount.count > 0) {
        // 대댓글이 있으면 내용만 삭제하고 "[삭제된 댓글입니다]"로 변경
        const updateStmt = db.prepare(`
          UPDATE comments 
          SET content = '[삭제된 댓글입니다]', updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND user_id = ?
        `);
        const result = updateStmt.run(commentId, userId);
        return { success: result.changes > 0, type: 'soft_delete' };
      } else {
        // 대댓글이 없으면 완전 삭제
        const deleteStmt = db.prepare(`
          DELETE FROM comments 
          WHERE id = ? AND user_id = ?
        `);
        const result = deleteStmt.run(commentId, userId);
        return { success: result.changes > 0, type: 'hard_delete' };
      }
    });
    
    return transaction();
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    return { success: false, error: '댓글 삭제에 실패했습니다.' };
  }
}

// 댓글 좋아요 관련 함수들
export function toggleCommentLike(userId: number, commentId: number) {
  const db = getDatabase();
  
  // 먼저 댓글이 존재하는지 확인
  const commentExistsStmt = db.prepare(`
    SELECT id FROM comments WHERE id = ?
  `);
  const commentExists = commentExistsStmt.get(commentId);
  
  if (!commentExists) {
    return { success: false, error: '댓글을 찾을 수 없습니다.' };
  }
  
  // 기존 좋아요 확인
  const checkStmt = db.prepare(`
    SELECT id FROM comment_likes 
    WHERE user_id = ? AND comment_id = ?
  `);
  
  const existing = checkStmt.get(userId, commentId);
  
  try {
    const transaction = db.transaction(() => {
      if (existing) {
        // 좋아요 해제
        const deleteStmt = db.prepare(`
          DELETE FROM comment_likes 
          WHERE user_id = ? AND comment_id = ?
        `);
        deleteStmt.run(userId, commentId);
        
        // 댓글의 좋아요 수 감소
        const updateStmt = db.prepare(`
          UPDATE comments 
          SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END
          WHERE id = ?
        `);
        updateStmt.run(commentId);
        
        return { success: true, action: 'removed' };
      } else {
        // 좋아요 추가
        const insertStmt = db.prepare(`
          INSERT INTO comment_likes (user_id, comment_id)
          VALUES (?, ?)
        `);
        insertStmt.run(userId, commentId);
        
        // 댓글의 좋아요 수 증가
        const updateStmt = db.prepare(`
          UPDATE comments 
          SET likes_count = likes_count + 1
          WHERE id = ?
        `);
        updateStmt.run(commentId);
        
        return { success: true, action: 'added' };
      }
    });
    
    return transaction();
  } catch (error) {
    console.error('댓글 좋아요 처리 실패:', error);
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

export function checkCommentLike(userId: number, commentId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id FROM comment_likes 
    WHERE user_id = ? AND comment_id = ?
  `);
  
  const result = stmt.get(userId, commentId);
  return !!result;
}

// 댓글 수 조회
export function getCommentCount(guestbookId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM comments WHERE guestbook_id = ?
  `);
  
  try {
    const result = stmt.get(guestbookId) as { count: number };
    return result.count;
  } catch (error) {
    console.error('댓글 수 조회 실패:', error);
    return 0;
  }
}

// 북마크 관련 함수들
export function toggleBookmark(userId: number, guestbookId: number) {
  const db = getDatabase();
  
  // 기존 북마크 확인
  const checkStmt = db.prepare(`
    SELECT id FROM bookmarks 
    WHERE user_id = ? AND guestbook_id = ?
  `);
  
  const existing = checkStmt.get(userId, guestbookId);
  
  try {
    if (existing) {
      // 북마크 해제
      const deleteStmt = db.prepare(`
        DELETE FROM bookmarks 
        WHERE user_id = ? AND guestbook_id = ?
      `);
      deleteStmt.run(userId, guestbookId);
      return { success: true, bookmarked: false };
    } else {
      // 북마크 추가
      const insertStmt = db.prepare(`
        INSERT INTO bookmarks (user_id, guestbook_id)
        VALUES (?, ?)
      `);
      insertStmt.run(userId, guestbookId);
      return { success: true, bookmarked: true };
    }
  } catch (error) {
    console.error('북마크 토글 실패:', error);
    return { success: false, error: '북마크 처리에 실패했습니다.' };
  }
}

export function checkBookmark(userId: number, guestbookId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id FROM bookmarks 
    WHERE user_id = ? AND guestbook_id = ?
  `);
  
  try {
    const result = stmt.get(userId, guestbookId);
    return !!result;
  } catch (error) {
    console.error('북마크 확인 실패:', error);
    return false;
  }
}

export function getUserBookmarks(userId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT g.*, u.nickname as author_nickname, b.created_at as bookmarked_at
    FROM bookmarks b
    JOIN guestbook g ON b.guestbook_id = g.id
    JOIN users u ON g.user_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `);
  
  try {
    const entries = stmt.all(userId);
    return entries.map((entry: any) => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));
  } catch (error) {
    console.error('북마크 목록 조회 실패:', error);
    return [];
  }
}

// 특정 방명록 글 조회
export function getGuestbookEntry(entryId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT g.*, u.nickname as author_nickname
    FROM guestbook g
    JOIN users u ON g.user_id = u.id
    WHERE g.id = ?
  `);
  
  try {
    const entry = stmt.get(entryId) as any;
    if (entry) {
      return {
        ...entry,
        tags: entry.tags ? JSON.parse(entry.tags) : []
      };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 사용자의 방명록 글 조회
export function getUserGuestbookEntries(userId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM guestbook 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `);
  
  try {
    const entries = stmt.all(userId);
    return entries.map((entry: any) => ({
      ...entry,
      tags: entry.tags ? JSON.parse(entry.tags) : []
    }));
  } catch (error) {
    return [];
  }
}

// 방명록 글 수정
export function updateGuestbookEntry(entryId: number, userId: number, updates: {
  title?: string;
  content?: string;
  location?: string;
  rating?: number;
  tags?: string[];
}) {
  const db = getDatabase();
  
  const fields = [];
  const params = [];
  
  if (updates.title) {
    fields.push('title = ?');
    params.push(updates.title);
  }
  if (updates.content) {
    fields.push('content = ?');
    params.push(updates.content);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    params.push(updates.location);
  }
  if (updates.rating !== undefined) {
    fields.push('rating = ?');
    params.push(updates.rating);
  }
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    params.push(JSON.stringify(updates.tags));
  }
  
  if (fields.length === 0) {
    return { success: false, error: '수정할 내용이 없습니다.' };
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  params.push(entryId, userId);
  
  const stmt = db.prepare(`
    UPDATE guestbook 
    SET ${fields.join(', ')} 
    WHERE id = ? AND user_id = ?
  `);
  
  try {
    const result = stmt.run(...params);
    return { success: true, changes: result.changes };
  } catch (error) {
    return { success: false, error: '방명록 수정에 실패했습니다.' };
  }
}

// 방명록 글 삭제
export function deleteGuestbookEntry(entryId: number, userId: number) {
  const db = getDatabase();
  
  // 먼저 해당 글이 존재하고 사용자가 작성자인지 확인
  const checkStmt = db.prepare(`
    SELECT id, user_id FROM guestbook 
    WHERE id = ?
  `);
  
  try {
    const entry = checkStmt.get(entryId) as any;
    
    if (!entry) {
      return { success: false, error: '삭제할 글을 찾을 수 없습니다.' };
    }
    
    if (entry.user_id !== userId) {
      return { success: false, error: '글을 삭제할 권한이 없습니다.' };
    }
    
    // 실제 삭제 수행
    const deleteStmt = db.prepare(`
      DELETE FROM guestbook 
      WHERE id = ? AND user_id = ?
    `);
    
    const result = deleteStmt.run(entryId, userId);
    
    if (result.changes > 0) {
      return { success: true, changes: result.changes };
    } else {
      return { success: false, error: '삭제 처리 중 오류가 발생했습니다.' };
    }
  } catch (error) {
    console.error('방명록 삭제 오류:', error);
    return { success: false, error: '방명록 삭제에 실패했습니다.' };
  }
}

// 방명록 좋아요 추가/취소 (토글)
export function toggleGuestbookLike(userId: number, entryId: number) {
  const db = getDatabase();
  
  try {
    // 트랜잭션 시작
    const result = db.transaction(() => {
      // 이미 좋아요 했는지 확인
      const checkStmt = db.prepare(`
        SELECT id FROM guestbook_likes 
        WHERE user_id = ? AND guestbook_id = ?
      `);
      const existingLike = checkStmt.get(userId, entryId);
      
      if (existingLike) {
        // 좋아요 취소
        const deleteLikeStmt = db.prepare(`
          DELETE FROM guestbook_likes 
          WHERE user_id = ? AND guestbook_id = ?
        `);
        deleteLikeStmt.run(userId, entryId);
        
        // 좋아요 수 감소
        const decrementStmt = db.prepare(`
          UPDATE guestbook 
          SET likes_count = likes_count - 1 
          WHERE id = ? AND likes_count > 0
        `);
        decrementStmt.run(entryId);
        
        return { action: 'removed', success: true };
      } else {
        // 좋아요 추가
        const insertLikeStmt = db.prepare(`
          INSERT INTO guestbook_likes (user_id, guestbook_id)
          VALUES (?, ?)
        `);
        insertLikeStmt.run(userId, entryId);
        
        // 좋아요 수 증가
        const incrementStmt = db.prepare(`
    UPDATE guestbook 
    SET likes_count = likes_count + 1 
    WHERE id = ?
  `);
        incrementStmt.run(entryId);
        
        return { action: 'added', success: true };
      }
    })();
    
    return result;
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: '이미 좋아요를 누르셨습니다.' };
    }
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

// 사용자가 특정 방명록 글에 좋아요 했는지 확인
export function checkGuestbookLike(userId: number, entryId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id FROM guestbook_likes 
    WHERE user_id = ? AND guestbook_id = ?
  `);
  
  const result = stmt.get(userId, entryId);
  return !!result;
}

// 뱃지 획득 조건 확인 및 뱃지 지급
export function checkAndAwardBadges(userId: number) {
  const db = getDatabase();
  
  try {
    const result = db.transaction(() => {
      const newBadges: any[] = [];
      
      // 사용자 통계 조회
      const stats = getUserStats(userId);
      
      // 모든 뱃지 조회
      const badgesStmt = db.prepare(`
        SELECT * FROM badges 
        WHERE id NOT IN (
          SELECT badge_id FROM user_badges WHERE user_id = ?
        )
      `);
      const availableBadges = badgesStmt.all(userId);
      
      // 각 뱃지 조건 확인
      for (const badge of availableBadges as any[]) {
        let shouldAward = false;
        
        switch (badge.condition_type) {
          case 'guestbook_count':
            shouldAward = stats.guestbookCount >= badge.condition_value;
            // achiever 카테고리는 추가 조건 확인
            if (shouldAward && badge.category === 'achiever') {
              if (badge.id === 'active_member') {
                shouldAward = stats.guestbookCount >= 5 && stats.likesReceived >= 20;
              } else if (badge.id === 'community_leader') {
                shouldAward = stats.guestbookCount >= 20 && stats.likesReceived >= 200;
              }
            }
            break;
          case 'likes_received':
            shouldAward = stats.likesReceived >= badge.condition_value;
            break;
          case 'likes_given':
            shouldAward = stats.likesGiven >= badge.condition_value;
            break;
          case 'property_liked':
            shouldAward = stats.propertyLiked >= badge.condition_value;
            break;
          case 'visit_count':
            shouldAward = true; // 첫 방문은 항상 true (사용자가 존재하면 이미 방문한 것)
            break;
        }
        
        if (shouldAward) {
          // 뱃지 지급
          const awardStmt = db.prepare(`
            INSERT INTO user_badges (user_id, badge_id)
            VALUES (?, ?)
          `);
          awardStmt.run(userId, badge.id);
          newBadges.push(badge);
        }
      }
      
      return newBadges;
    })();
    
    return { success: true, newBadges: result };
  } catch (error) {
    console.error('뱃지 확인 및 지급 실패:', error);
    return { success: false, error: '뱃지 처리에 실패했습니다.' };
  }
}

// 사용자 통계 조회
export function getUserStats(userId: number) {
  const db = getDatabase();
  
  try {
    // 방명록 작성 수
    const guestbookStmt = db.prepare(`
      SELECT COUNT(*) as count FROM guestbook WHERE user_id = ?
    `);
    const guestbookCount = (guestbookStmt.get(userId) as any)?.count || 0;
    
    // 받은 좋아요 수
    const likesReceivedStmt = db.prepare(`
      SELECT SUM(g.likes_count) as total 
      FROM guestbook g 
      WHERE g.user_id = ?
    `);
    const likesReceived = (likesReceivedStmt.get(userId) as any)?.total || 0;
    
    // 누른 좋아요 수
    const likesGivenStmt = db.prepare(`
      SELECT COUNT(*) as count FROM guestbook_likes WHERE user_id = ?
    `);
    const likesGiven = (likesGivenStmt.get(userId) as any)?.count || 0;
    
    // 관심목록에 추가한 집 수
    const propertyLikedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM user_likes WHERE user_id = ?
    `);
    const propertyLiked = (propertyLikedStmt.get(userId) as any)?.count || 0;
    
    return {
      guestbookCount,
      likesReceived,
      likesGiven,
      propertyLiked
    };
  } catch (error) {
    console.error('사용자 통계 조회 실패:', error);
    return {
      guestbookCount: 0,
      likesReceived: 0,
      likesGiven: 0,
      propertyLiked: 0
    };
  }
}

// 사용자의 모든 뱃지 조회
export function getUserBadges(userId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT b.*, ub.earned_at
    FROM user_badges ub
    JOIN badges b ON ub.badge_id = b.id
    WHERE ub.user_id = ?
    ORDER BY ub.earned_at DESC
  `);
  
  try {
    return stmt.all(userId);
  } catch (error) {
    console.error('사용자 뱃지 조회 실패:', error);
    return [];
  }
}

// 모든 뱃지 목록 조회
export function getAllBadges() {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM badges 
    ORDER BY category, condition_value
  `);
  
  try {
    return stmt.all();
  } catch (error) {
    console.error('뱃지 목록 조회 실패:', error);
    return [];
  }
}

// 특정 뱃지 획득 여부 확인
export function hasUserBadge(userId: number, badgeId: string) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT id FROM user_badges 
    WHERE user_id = ? AND badge_id = ?
  `);
  
  const result = stmt.get(userId, badgeId);
  return !!result;
}

// 인기 게시글 조회
export function getPopularPosts(options?: {
  featured?: boolean;
  category?: string;
  limit?: number;
  orderBy?: 'likes' | 'views' | 'created_at';
}) {
  const db = getDatabase();
  
  let query = `SELECT * FROM popular_posts WHERE 1=1`;
  const params: any[] = [];
  
  if (options?.featured !== undefined) {
    query += ` AND featured = ?`;
    params.push(options.featured ? 1 : 0);  // 불린을 정수로 변환
  }
  
  if (options?.category) {
    query += ` AND category = ?`;
    params.push(options.category);
  }
  
  // 정렬 기준
  const orderBy = options?.orderBy || 'likes';
  query += ` ORDER BY ${orderBy} DESC, created_at DESC`;
  
  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
  }
  
  const stmt = db.prepare(query);
  
  try {
    return stmt.all(...params);
  } catch (error) {
    console.error('인기 게시글 조회 실패:', error);
    return [];
  }
}

// 게시글 조회수 증가
export function incrementPostViews(postId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE popular_posts 
    SET views = views + 1 
    WHERE id = ?
  `);
  
  try {
    const result = stmt.run(postId);
    return { success: true, changes: result.changes };
  } catch (error) {
    console.error('조회수 증가 실패:', error);
    return { success: false, error: '조회수 증가에 실패했습니다.' };
  }
}

// 특정 게시글 조회
export function getPopularPost(postId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM popular_posts WHERE id = ?
  `);
  
  try {
    return stmt.get(postId);
  } catch (error) {
    console.error('게시글 조회 실패:', error);
    return null;
  }
}

// 데이터베이스 연결 종료
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}