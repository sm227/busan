import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

// S3 클라이언트 초기화 (S3 전용 계정 사용)
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || "",
  },
});

interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * 파일을 S3에 업로드
 * @param file - 업로드할 파일 객체
 * @param folder - S3 버킷 내 폴더명 (예: "classes", "properties")
 * @returns 업로드 결과 (성공 여부, URL, 파일명, 에러)
 */
export async function uploadFileToS3(
  file: File,
  folder: string
): Promise<UploadResult> {
  try {
    // 고유한 파일명 생성
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name);
    const filename = `${timestamp}_${randomStr}${ext}`;

    // S3 키 생성 (폴더/파일명)
    const key = `${folder}/${filename}`;

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // S3에 업로드 (ACL 없이 - 버킷 정책으로 공개 읽기 허용됨)
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "binjib-dabang",
      Key: key,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(command);

    // S3 URL 생성
    const url = `https://${process.env.AWS_S3_BUCKET_NAME || "binjib-dabang"}.s3.${process.env.AWS_S3_REGION || "ap-northeast-2"}.amazonaws.com/${key}`;

    return {
      success: true,
      url,
      filename,
    };
  } catch (error: any) {
    console.error("S3 upload error:", error);

    // 에러 메시지 파싱
    let errorMessage = "S3 업로드 중 오류가 발생했습니다.";

    if (error.name === "NoSuchBucket") {
      errorMessage = "S3 버킷을 찾을 수 없습니다.";
    } else if (error.name === "AccessDenied" || error.name === "InvalidAccessKeyId") {
      errorMessage = "S3 접근 권한이 없습니다. AWS 자격 증명을 확인해주세요.";
    } else if (error.name === "NetworkingError") {
      errorMessage = "네트워크 오류가 발생했습니다.";
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * S3에서 파일 다운로드
 * @param key - S3 객체 키 (예: "glue-output/analytics/latest.json")
 * @returns 파일 내용 (string)
 */
export async function downloadFileFromS3(key: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || "binjib-dabang",
      Key: key,
    });

    const response = await s3Client.send(command);

    // Stream을 문자열로 변환
    const str = await response.Body?.transformToString();

    if (!str) {
      throw new Error("Empty file content");
    }

    return str;
  } catch (error: any) {
    console.error("S3 download error:", error);

    if (error.name === "NoSuchKey") {
      throw new Error("파일을 찾을 수 없습니다.");
    } else if (error.name === "AccessDenied") {
      throw new Error("S3 접근 권한이 없습니다.");
    }

    throw error;
  }
}

/**
 * S3에서 JSON 파일 다운로드 및 파싱
 * @param key - S3 객체 키
 * @returns 파싱된 JSON 객체
 */
export async function downloadJsonFromS3<T = any>(key: string): Promise<T> {
  const content = await downloadFileFromS3(key);
  return JSON.parse(content);
}
