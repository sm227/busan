import { NextRequest, NextResponse } from 'next/server';
import { saveUserLike, removeUserLike, getUserLikes, checkUserLike } from '@/lib/database';

// 관심목록 추가
export async function POST(request: NextRequest) {
  try {
    const { userId, property } = await request.json();

    // 입력 값 검증
    if (!userId || !property) {
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 속성 데이터 검증
    const requiredFields = ['id', 'title', 'location', 'price', 'matchScore'];
    const missingFields = requiredFields.filter(field => property[field] === undefined);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `누락된 속성 데이터: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 관심목록에 추가
    const result = await saveUserLike(userId, {
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyPrice: property.price,
      matchScore: property.matchScore
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        
        message: '관심목록에 추가되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('관심목록 추가 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 관심목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const propertyId = searchParams.get('propertyId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 특정 속성 좋아요 여부 확인
    if (propertyId) {
      const isLiked = await checkUserLike(parseInt(userId), propertyId);
      return NextResponse.json({
        success: true,
        isLiked
      });
    }

    // 모든 관심목록 조회
    const likes = await getUserLikes(parseInt(userId));
    return NextResponse.json({
      success: true,
      data: likes
    });
  } catch (error) {
    console.error('관심목록 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 관심목록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { userId, propertyId } = await request.json();

    if (!userId || !propertyId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID와 속성 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await removeUserLike(userId, propertyId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        
        message: '관심목록에서 제거되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('관심목록 삭제 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}