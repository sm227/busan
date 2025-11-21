import { NextRequest, NextResponse } from 'next/server';
import { getPopularPosts, getPopularPost, incrementPostViews } from '@/lib/database';

// 인기 게시글 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('id');
    const featured = searchParams.get('featured');
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');
    const orderBy = searchParams.get('orderBy') as 'likes' | 'views' | 'created_at' | null;

    // 특정 게시글 조회
    if (postId) {
      const post = await getPopularPost(parseInt(postId));
      if (post) {
        // 조회수 증가
        await incrementPostViews(parseInt(postId));
        return NextResponse.json({
          success: true,
          data: post
        });
      } else {
        return NextResponse.json(
          { success: false, error: '게시글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 게시글 목록 조회
    const options: any = {};
    
    if (featured !== null) {
      options.featured = featured === 'true';
    }
    
    if (category) {
      options.category = category;
    }
    
    if (limit) {
      options.limit = parseInt(limit);
    }
    
    if (orderBy) {
      options.orderBy = orderBy;
    }

    const posts = await getPopularPosts(options);

    return NextResponse.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('인기 게시글 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 게시글 조회수 증가
export async function PATCH(request: NextRequest) {
  try {
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json(
        { success: false, error: '게시글 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const result = await incrementPostViews(postId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '조회수가 증가되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: "조회수 증가에 실패했습니다." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('조회수 증가 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
