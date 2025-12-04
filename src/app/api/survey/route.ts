import { NextRequest, NextResponse } from 'next/server';
import { saveSurveyResult, getUserSurveyResult } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { userId, preferences } = await request.json();

    console.log('📝 설문 저장 요청:', { userId, preferences });

    // 입력 값 검증
    if (!userId || !preferences) {
      console.error('❌ 필수 데이터 누락:', { userId, preferences });
      return NextResponse.json(
        { success: false, error: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 설문 응답 검증
    const requiredFields = ['livingStyle', 'socialStyle', 'workStyle', 'hobbyStyle', 'pace', 'purchaseType', 'budget'];
    const missingFields = requiredFields.filter(field => !preferences[field]);

    if (missingFields.length > 0) {
      console.error('❌ 누락된 설문 항목:', missingFields, '받은 데이터:', preferences);
      return NextResponse.json(
        { success: false, error: `누락된 설문 항목: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 설문 결과 저장
    const result = await saveSurveyResult(userId, {
      occupation: preferences.occupation,
      livingStyle: preferences.livingStyle,
      socialStyle: preferences.socialStyle,
      workStyle: preferences.workStyle,
      hobbyStyle: preferences.hobbyStyle,
      pace: preferences.pace,
      purchaseType: preferences.purchaseType,
      budget: preferences.budget
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: '설문 결과가 성공적으로 저장되었습니다.'
      });
    } else{
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('설문 저장 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 사용자의 설문 결과 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const surveyResult = await getUserSurveyResult(parseInt(userId));

    if (surveyResult) {
      return NextResponse.json({
        success: true,
        data: surveyResult
      });
    } else {
      return NextResponse.json(
        { success: false, error: '설문 결과를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('설문 조회 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}