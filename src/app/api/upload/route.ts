import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { uploadFileToS3 } from "@/lib/s3-upload";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // 단일 파일 업로드 (썸네일용)
    const file = formData.get("file") as File | null;

    // 다중 파일 업로드 (properties용)
    const files = formData.getAll("images") as File[];

    // 단일 파일 업로드 처리 (썸네일용 - S3 사용)
    if (file) {
      // 파일 검증
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: "이미지 파일만 업로드 가능합니다" },
          { status: 400 }
        );
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, error: "파일 크기는 5MB 이하여야 합니다" },
          { status: 400 }
        );
      }

      // S3에 업로드
      const uploadResult = await uploadFileToS3(file, "classes");

      if (!uploadResult.success) {
        return NextResponse.json(
          { success: false, error: uploadResult.error || "S3 업로드 실패" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        url: uploadResult.url,
        filename: uploadResult.filename,
      });
    }

    // 다중 파일 업로드 처리 (기존 로직)
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "파일이 없습니다" },
        { status: 400 }
      );
    }

    // 업로드 디렉토리 설정
    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");

    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // 파일 검증
      if (!file.type.startsWith("image/")) {
        continue;
      }

      // 파일 크기 제한 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // 고유한 파일명 생성
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = path.extname(file.name);
      const filename = `${timestamp}_${randomStr}${ext}`;

      // 파일 저장
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // URL 생성 (public 기준 상대 경로)
      uploadedUrls.push(`/uploads/properties/${filename}`);
    }

    return NextResponse.json({
      success: true,
      data: { urls: uploadedUrls }
    });

  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, error: "이미지 업로드 실패" },
      { status: 500 }
    );
  }
}
