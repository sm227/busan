import { NextRequest, NextResponse } from 'next/server';
import { getOneDayClasses, getOneDayClass, createOneDayClass } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const userId = searchParams.get('userId');

    // Single class detail
    if (classId) {
      const classData = await getOneDayClass(
        classId,
        userId ? parseInt(userId) : undefined
      );

      if (!classData) {
        return NextResponse.json(
          { success: false, error: '클래스를 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: classData });
    }

    // List with filters
    const filters = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      province: searchParams.get('province') || undefined,
      city: searchParams.get('city') || undefined,
      difficulty: searchParams.get('difficulty') || undefined,
      minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') || 'DESC') as 'ASC' | 'DESC',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    const classes = await getOneDayClasses(filters);

    return NextResponse.json({
      success: true,
      data: classes,
      count: classes.length
    });
  } catch (error) {
    console.error('Classes API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...classData } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Validation
    if (!classData.title || !classData.description || !classData.category) {
      return NextResponse.json(
        { success: false, error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (classData.price < 0) {
      return NextResponse.json(
        { success: false, error: '가격은 0 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    const result = await createOneDayClass(parseInt(userId), classData);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      classId: result.classId,
      message: '클래스가 성공적으로 등록되었습니다.'
    });
  } catch (error) {
    console.error('Class creation API error:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
