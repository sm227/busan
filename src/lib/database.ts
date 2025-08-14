import Database from 'better-sqlite3';
import path from 'path';

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), 'data', 'app.db');

// 데이터베이스 인스턴스
let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    
    // WAL 모드로 설정 (성능 향상)
    db.pragma('journal_mode = WAL');
    
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
  
  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
    CREATE INDEX IF NOT EXISTS idx_survey_results_user_id ON survey_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_property_id ON user_likes(property_id);
  `);
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
    return { success: true, userId: result.lastInsertRowid };
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

// 데이터베이스 연결 종료
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}