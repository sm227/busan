import { NextRequest, NextResponse } from "next/server";
import { getOccupationStats } from "@/lib/athena-client";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";

    // 캐시 확인 (refresh가 아닐 때만)
    if (!refresh) {
      const cached = await prisma.analyticsCache.findUnique({
        where: { queryType: "occupation" },
      });

      if (cached) {
        console.log("📦 Using cached occupation statistics");
        return NextResponse.json({
          success: true,
          data: cached.data,
          cached: true,
          cachedAt: cached.updatedAt,
        });
      }
    }

    console.log("📊 Fetching occupation statistics from Athena...");

    const result = await getOccupationStats();

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to fetch statistics" },
        { status: 500 }
      );
    }

    // 캐시에 저장
    await prisma.analyticsCache.upsert({
      where: { queryType: "occupation" },
      update: { data: result.data as any },
      create: { queryType: "occupation", data: result.data as any },
    });

    console.log("💾 Cached occupation statistics");

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
