import { NextRequest, NextResponse } from "next/server";
import {
  getLivingStyleStats,
  getBudgetStats,
  getMonthlyTrend,
} from "@/lib/athena-client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "living_style";
    const refresh = searchParams.get("refresh") === "true";

    // 캐시 확인 (refresh가 아닐 때만)
    if (!refresh) {
      const cached = await prisma.analyticsCache.findUnique({
        where: { queryType: type },
      });

      if (cached) {
        console.log(`📦 Using cached ${type} statistics`);
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
          cachedAt: cached.updatedAt,
        });
      }
    }

    console.log(`📊 Fetching ${type} statistics from Athena...`);

    let result;

    switch (type) {
      case "living_style":
        result = await getLivingStyleStats();
        break;
      case "budget":
        result = await getBudgetStats();
        break;
      case "trend":
        result = await getMonthlyTrend();
        break;
      default:
        return NextResponse.json(
          { success: false, error: "Invalid statistics type" },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fetch statistics" },
        { status: 500 }
      );
    }

    // 캐시에 저장
    await prisma.analyticsCache.upsert({
      where: { queryType: type },
      update: { data: result.data },
      create: { queryType: type, data: result.data },
    });

    console.log(`💾 Cached ${type} statistics`);

    return NextResponse.json({
      success: true,
      data: result.data,
      columns: result.columns,
      cached: false,
    });
  } catch (error: any) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
