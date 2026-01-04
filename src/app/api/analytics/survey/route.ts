import { NextResponse } from "next/server";
import { downloadJsonFromS3 } from "@/lib/s3-upload";

export interface SurveyAnalytics {
  generated_at: string;
  total_surveys: number;
  preference_distribution: {
    living_style?: Record<string, number>;
    social_style?: Record<string, number>;
    work_style?: Record<string, number>;
    hobby_style?: Record<string, number>;
    pace?: Record<string, number>;
    budget?: Record<string, number>;
    purchase_type?: Record<string, number>;
  };
  trends: {
    daily_submissions?: Record<string, number>;
    total_surveys?: number;
  };
  occupation_distribution: {
    top_occupations?: Array<{ occupation: string; count: number }>;
    total_with_occupation?: number;
  };
  correlations: Record<string, any>;
  insights: string[];
}

/**
 * GET /api/analytics/survey
 * S3에서 최신 설문 분석 결과 조회
 */
export async function GET() {
  try {
    // S3에서 latest.json 파일 다운로드
    const analytics = await downloadJsonFromS3<SurveyAnalytics>(
      "glue-output/analytics/latest.json"
    );

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("Error fetching survey analytics:", error);

    // 파일이 없는 경우
    if (error.message?.includes("찾을 수 없습니다")) {
      return NextResponse.json(
        {
          success: false,
          error: "분석 결과가 아직 생성되지 않았습니다. 관리자 페이지에서 분석을 실행해주세요.",
        },
        { status: 404 }
      );
    }

    // 기타 에러
    return NextResponse.json(
      {
        success: false,
        error: "분석 결과를 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
