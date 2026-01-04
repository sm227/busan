import { NextRequest, NextResponse } from "next/server";
import { startGlueJob } from "@/lib/glue-client";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

/**
 * POST /api/admin/trigger-analytics
 * 관리자 전용: 설문 데이터 분석 파이프라인 실행
 *
 * 실행 순서:
 * 1. PostgreSQL → S3 데이터 내보내기
 * 2. AWS Glue Job 시작
 */
export async function POST(request: NextRequest) {
  try {
    // TODO: 관리자 권한 확인 (실제 환경에서 필요)
    // const session = await getServerSession();
    // if (session?.user?.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    console.log("📊 Starting analytics pipeline...");

    // Step 1: Export surveys to S3
    console.log("1️⃣ Exporting surveys from PostgreSQL to S3...");

    const scriptsDir = path.join(process.cwd(), "scripts");
    const exportScript = path.join(scriptsDir, "export-surveys-to-s3.js");

    let exportResult;
    try {
      const { stdout, stderr } = await execAsync(`node ${exportScript}`, {
        env: { ...process.env },
        cwd: process.cwd(),
      });

      console.log("Export stdout:", stdout);
      if (stderr) console.error("Export stderr:", stderr);

      // Parse export result from stdout (last JSON line)
      const lines = stdout.trim().split("\n");
      const lastLine = lines[lines.length - 1];

      try {
        exportResult = JSON.parse(lastLine);
      } catch {
        // If parsing fails, extract key from stdout
        const keyMatch = stdout.match(/glue-input\/surveys\/[^\s]+\.csv/);
        if (keyMatch) {
          exportResult = { key: keyMatch[0] };
        } else {
          throw new Error("Failed to parse export result");
        }
      }
    } catch (error: any) {
      console.error("Export script error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "데이터 내보내기 실패",
          details: error.message,
        },
        { status: 500 }
      );
    }

    console.log("✅ Export completed:", exportResult);

    // Step 2: Start Glue Job
    console.log("2️⃣ Starting AWS Glue Job...");

    const jobName = process.env.AWS_GLUE_JOB_NAME || "survey-analytics-job";
    const inputKey = exportResult.key;

    let glueResult;
    try {
      glueResult = await startGlueJob(jobName, inputKey);
      console.log("✅ Glue job started:", glueResult);
    } catch (error: any) {
      console.error("Glue job start error:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Glue Job 시작 실패",
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "분석 파이프라인이 시작되었습니다",
      data: {
        export: {
          recordCount: exportResult.recordCount,
          s3Key: exportResult.key,
        },
        glue: {
          jobName: glueResult.jobName,
          jobRunId: glueResult.jobRunId,
        },
      },
    });
  } catch (error: any) {
    console.error("Analytics pipeline error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "분석 파이프라인 실행 중 오류가 발생했습니다",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
