import {
  AthenaClient,
  StartQueryExecutionCommand,
  GetQueryExecutionCommand,
  GetQueryResultsCommand,
  QueryExecutionState,
} from "@aws-sdk/client-athena";

const athenaClient = new AthenaClient({
  region: process.env.AWS_S3_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

const DATABASE = "survey_analytics";
const OUTPUT_LOCATION = `s3://${process.env.AWS_S3_BUCKET_NAME || "binjib-dabang"}/athena-results/`;

/**
 * Athena 쿼리 실행 및 결과 반환
 * @param query - SQL 쿼리문
 * @param maxWaitTime - 최대 대기 시간 (ms)
 * @returns 쿼리 결과
 */
export async function executeAthenaQuery(
  query: string,
  maxWaitTime: number = 30000
): Promise<{ success: boolean; data?: any[]; columns?: string[]; error?: string }> {
  try {
    // 1. 쿼리 실행 시작
    const startCommand = new StartQueryExecutionCommand({
      QueryString: query,
      QueryExecutionContext: {
        Database: DATABASE,
      },
      ResultConfiguration: {
        OutputLocation: OUTPUT_LOCATION,
      },
    });

    const startResult = await athenaClient.send(startCommand);
    const queryExecutionId = startResult.QueryExecutionId!;

    console.log(`🔍 Athena query started: ${queryExecutionId}`);

    // 2. 쿼리 완료 대기
    const startTime = Date.now();
    let queryStatus: QueryExecutionState | undefined = QueryExecutionState.RUNNING;

    while (
      (queryStatus === QueryExecutionState.RUNNING || queryStatus === QueryExecutionState.QUEUED) &&
      Date.now() - startTime < maxWaitTime
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 대기

      const statusCommand = new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      });

      const statusResult = await athenaClient.send(statusCommand);
      queryStatus = statusResult.QueryExecution?.Status?.State;

      console.log(`⏳ Query status: ${queryStatus}`);
    }

    // 3. 타임아웃 체크
    if (queryStatus === QueryExecutionState.RUNNING || queryStatus === QueryExecutionState.QUEUED) {
      throw new Error("Query timeout");
    }

    // 4. 실패 체크
    if (queryStatus !== QueryExecutionState.SUCCEEDED) {
      const statusCommand = new GetQueryExecutionCommand({
        QueryExecutionId: queryExecutionId,
      });
      const statusResult = await athenaClient.send(statusCommand);
      const errorMessage = statusResult.QueryExecution?.Status?.StateChangeReason || "Query failed";
      throw new Error(errorMessage);
    }

    // 5. 결과 가져오기
    const resultsCommand = new GetQueryResultsCommand({
      QueryExecutionId: queryExecutionId,
      MaxResults: 1000, // 최대 1000개 결과
    });

    const resultsData = await athenaClient.send(resultsCommand);
    const rows = resultsData.ResultSet?.Rows || [];

    if (rows.length === 0) {
      return { success: true, data: [], columns: [] };
    }

    // 6. 결과 포맷팅
    const columns = rows[0]?.Data?.map((col) => col.VarCharValue || "") || [];
    const data = rows.slice(1).map((row) => {
      const obj: any = {};
      row.Data?.forEach((cell, index) => {
        obj[columns[index]] = cell.VarCharValue;
      });
      return obj;
    });

    console.log(`✅ Query succeeded: ${data.length} rows returned`);

    return {
      success: true,
      data,
      columns,
    };
  } catch (error: any) {
    console.error("❌ Athena query error:", error);
    return {
      success: false,
      error: error.message || "Athena query failed",
    };
  }
}

/**
 * 직업별 선호 스타일 통계 조회
 */
export async function getOccupationStats() {
  const query = `
    SELECT
      occupation,
      living_style,
      work_style,
      social_style,
      COUNT(*) as count
    FROM ${DATABASE}.analytics
    WHERE occupation IS NOT NULL AND occupation != ''
    GROUP BY occupation, living_style, work_style, social_style
    ORDER BY occupation, count DESC
  `;

  return executeAthenaQuery(query);
}

/**
 * Living Style 분포 통계
 */
export async function getLivingStyleStats() {
  const query = `
    SELECT
      living_style,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${DATABASE}.analytics), 2) as percentage
    FROM ${DATABASE}.analytics
    GROUP BY living_style
    ORDER BY count DESC
  `;

  return executeAthenaQuery(query);
}

/**
 * Budget 분포 통계
 */
export async function getBudgetStats() {
  const query = `
    SELECT
      budget,
      COUNT(*) as count,
      ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ${DATABASE}.analytics), 2) as percentage
    FROM ${DATABASE}.analytics
    GROUP BY budget
    ORDER BY count DESC
  `;

  return executeAthenaQuery(query);
}

/**
 * 월별 트렌드 통계
 */
export async function getMonthlyTrend() {
  const query = `
    SELECT
      year,
      month,
      COUNT(*) as responses,
      COUNT(DISTINCT user_id) as unique_users
    FROM ${DATABASE}.analytics
    GROUP BY year, month
    ORDER BY year DESC, month DESC
    LIMIT 12
  `;

  return executeAthenaQuery(query);
}
