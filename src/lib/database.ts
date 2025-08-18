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
  
  // 방명록 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS guestbook (
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
  
  // 인덱스 생성
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);
    CREATE INDEX IF NOT EXISTS idx_survey_results_user_id ON survey_results(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_user_id ON user_likes(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_likes_property_id ON user_likes(property_id);
    CREATE INDEX IF NOT EXISTS idx_guestbook_user_id ON guestbook(user_id);
    CREATE INDEX IF NOT EXISTS idx_guestbook_category ON guestbook(category);
    CREATE INDEX IF NOT EXISTS idx_guestbook_created_at ON guestbook(created_at);
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
    return { success: true, entryId: result.lastInsertRowid };
  } catch (error) {
    return { success: false, error: '방명록 작성에 실패했습니다.' };
  }
}

// 방명록 목록 조회
export function getGuestbookEntries(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}) {
  const db = getDatabase();
  
  let query = `
    SELECT g.*, u.nickname as author_nickname
    FROM guestbook g
    JOIN users u ON g.user_id = u.id
  `;
  
  const params: any[] = [];
  
  if (options?.category) {
    query += ` WHERE g.category = ?`;
    params.push(options.category);
  }
  
  query += ` ORDER BY g.created_at DESC`;
  
  if (options?.limit) {
    query += ` LIMIT ?`;
    params.push(options.limit);
    
    if (options?.offset) {
      query += ` OFFSET ?`;
      params.push(options.offset);
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

// 방명록 좋아요 증가
export function incrementGuestbookLikes(entryId: number) {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE guestbook 
    SET likes_count = likes_count + 1 
    WHERE id = ?
  `);
  
  try {
    const result = stmt.run(entryId);
    return { success: true, changes: result.changes };
  } catch (error) {
    return { success: false, error: '좋아요 처리에 실패했습니다.' };
  }
}

// 데이터베이스 연결 종료
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}