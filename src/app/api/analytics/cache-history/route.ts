import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // 모든 캐시 기록을 최신순으로 가져오기
    const cacheHistory = await prisma.analyticsCache.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: cacheHistory
    });
  } catch (error: any) {
    console.error("Cache history API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
