import { GlueClient, StartJobRunCommand, GetJobRunCommand } from "@aws-sdk/client-glue";

// Glue 클라이언트 초기화
const glueClient = new GlueClient({
  region: process.env.AWS_S3_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

export interface GlueJobResult {
  jobRunId: string;
  jobName: string;
}

export interface GlueJobStatus {
  jobRunId: string;
  status: string; // STARTING | RUNNING | STOPPING | STOPPED | SUCCEEDED | FAILED | TIMEOUT
  startedOn?: Date;
  completedOn?: Date;
  errorMessage?: string;
}

/**
 * AWS Glue Job 시작
 * @param jobName - Glue Job 이름
 * @param inputKey - S3 input 파일 키 (예: "glue-input/surveys/surveys_2026-01-04.csv")
 * @returns Job Run ID
 */
export async function startGlueJob(
  jobName: string,
  inputKey: string
): Promise<GlueJobResult> {
  try {
    const outputBucket = process.env.AWS_S3_BUCKET_NAME || "binjib-dabang";

    const command = new StartJobRunCommand({
      JobName: jobName,
      Arguments: {
        "--input_key": inputKey,
        "--output_bucket": outputBucket,
      },
    });

    const response = await glueClient.send(command);

    if (!response.JobRunId) {
      throw new Error("Failed to start Glue job: No JobRunId returned");
    }

    return {
      jobRunId: response.JobRunId,
      jobName,
    };
  } catch (error: any) {
    console.error("Error starting Glue job:", error);
    throw new Error(`Glue Job 시작 실패: ${error.message}`);
  }
}

/**
 * Glue Job 실행 상태 확인
 * @param jobName - Glue Job 이름
 * @param jobRunId - Job Run ID
 * @returns Job 상태 정보
 */
export async function checkJobStatus(
  jobName: string,
  jobRunId: string
): Promise<GlueJobStatus> {
  try {
    const command = new GetJobRunCommand({
      JobName: jobName,
      RunId: jobRunId,
    });

    const response = await glueClient.send(command);

    if (!response.JobRun) {
      throw new Error("Job run not found");
    }

    return {
      jobRunId,
      status: response.JobRun.JobRunState || "UNKNOWN",
      startedOn: response.JobRun.StartedOn,
      completedOn: response.JobRun.CompletedOn,
      errorMessage: response.JobRun.ErrorMessage,
    };
  } catch (error: any) {
    console.error("Error checking Glue job status:", error);
    throw new Error(`Job 상태 확인 실패: ${error.message}`);
  }
}

/**
 * Glue Job이 완료될 때까지 대기 (polling)
 * @param jobName - Glue Job 이름
 * @param jobRunId - Job Run ID
 * @param maxWaitSeconds - 최대 대기 시간 (초)
 * @param pollIntervalSeconds - 폴링 간격 (초)
 * @returns 최종 Job 상태
 */
export async function waitForJobCompletion(
  jobName: string,
  jobRunId: string,
  maxWaitSeconds: number = 300, // 5분
  pollIntervalSeconds: number = 10
): Promise<GlueJobStatus> {
  const startTime = Date.now();
  const maxWaitMs = maxWaitSeconds * 1000;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkJobStatus(jobName, jobRunId);

    // 완료 상태 확인
    if (["SUCCEEDED", "FAILED", "STOPPED", "TIMEOUT"].includes(status.status)) {
      return status;
    }

    // 다음 폴링까지 대기
    await new Promise((resolve) => setTimeout(resolve, pollIntervalSeconds * 1000));
  }

  // 타임아웃
  throw new Error(`Job completion timeout after ${maxWaitSeconds} seconds`);
}
