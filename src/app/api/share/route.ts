import { NextRequest, NextResponse } from 'next/server';
import { getGuestbookEntry } from '@/lib/database';

// 게시글 공유 정보 생성
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const guestbookId = searchParams.get('guestbookId');

    if (!guestbookId) {
      return NextResponse.json(
        { success: false, error: '방명록 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const entry = await getGuestbookEntry(parseInt(guestbookId));

    if (!entry) {
      return NextResponse.json(
        { success: false, error: '방명록 글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 공유용 데이터 생성
    const shareData = {
      title: entry.title,
      description: entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : ''),
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/guestbook/${entry.id}`,
      author: entry.author_nickname,
      location: entry.location,
      category: entry.category,
      tags: entry.tags,
      likes: entry.likes_count,
      rating: entry.rating
    };

    return NextResponse.json({
      success: true,
      data: shareData
    });
  } catch (error) {
    console.error('공유 정보 생성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
