import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

/**
 * 설문 응답 데이터를 S3에 업로드
 * @param surveyData - 설문 응답 데이터
 * @returns 업로드 결과
 */
export async function uploadSurveyToS3(surveyData: {
  id: number;
  userId: number;
  occupation?: string | null;
  livingStyle: string;
  socialStyle: string;
  workStyle: string;
  hobbyStyle: string;
  pace: string;
  purchaseType: string;
  budget: string;
  createdAt: Date;
}) {
  try {
    const date = surveyData.createdAt;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // S3 키 생성 (surveyresults 폴더 + 파티션 구조)
    const key = `surveyresults/year=${year}/month=${month}/day=${day}/survey_${surveyData.id}_${surveyData.userId}.json`;

    // JSON 데이터 준비 (null 값은 빈 문자열로 변환)
    const jsonData = {
      survey_id: surveyData.id,
      user_id: surveyData.userId,
      occupation: surveyData.occupation || "",
      living_style: surveyData.livingStyle,
      social_style: surveyData.socialStyle,
      work_style: surveyData.workStyle,
      hobby_style: surveyData.hobbyStyle,
      pace: surveyData.pace,
      purchase_type: surveyData.purchaseType,
      budget: surveyData.budget,
      created_at: surveyData.createdAt.toISOString(),
    };

    // S3에 업로드 (Athena는 한 줄 JSON을 선호함)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "binjib-dabang",
      Key: key,
      Body: JSON.stringify(jsonData),
      ContentType: "application/json",
    });

    await s3Client.send(command);

    console.log(`Survey #${surveyData.id} uploaded to S3: ${key}`);

    return {
      success: true,
      s3_key: key,
      s3_url: `s3://${process.env.AWS_S3_BUCKET_NAME || "binjib-dabang"}/${key}`,
    };
  } catch (error: any) {
    console.error("S3 upload error:", error);

    return {
      success: false,
      error: error.message || "S3 업로드 실패",
    };
  }
}
