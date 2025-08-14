import { NextRequest, NextResponse } from 'next/server';
import { createUser, authenticateUser } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { nickname, password } = await request.json();

    // 입력 값 검증
    if (!nickname || !password) {
      return NextResponse.json(
        { success: false, error: '닉네임과 비밀번호를 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (nickname.length < 2 || nickname.length > 10) {
      return NextResponse.json(
        { success: false, error: '닉네임은 2-10글자로 입력해주세요.' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: '비밀번호는 4자리 숫자로 입력해주세요.' },
        { status: 400 }
      );
    }

    // 사용자 생성
    const result = createUser(nickname.trim(), password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        userId: result.userId,
        message: '사용자가 성공적으로 생성되었습니다.'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('사용자 생성 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 로그인 처리
export async function PUT(request: NextRequest) {
  try {
    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json(
        { success: false, error: '닉네임과 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = authenticateUser(nickname.trim(), password);

    if (result.success) {
      return NextResponse.json({
        success: true,
        user: result.user,
        message: '로그인 성공'
      });
    } else {
      return NextResponse.json(
        { success: false, error: '닉네임 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('로그인 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}