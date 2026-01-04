"use client";

import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";

interface BlurredImageProps {
  src: string;
  alt: string;
  className?: string;
  blurWhenLoggedOut?: boolean; // 기본값: true
}

export function BlurredImage({
  src,
  alt,
  className = "",
  blurWhenLoggedOut = true,
}: BlurredImageProps) {
  const { currentUser } = useApp();
  const router = useRouter();
  const shouldBlur = blurWhenLoggedOut && !currentUser;

  const handleClick = () => {
    if (shouldBlur) {
      router.push('/login');
    }
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={`${className} ${shouldBlur ? "filter blur-md" : ""}`}
      />
      {shouldBlur && (
        <div
          onClick={handleClick}
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
        >
          <div className="text-white text-sm font-bold bg-stone-800/80 px-4 py-2 rounded-full pointer-events-none">
            로그인하고 전체 보기 →
          </div>
        </div>
      )}
    </div>
  );
}
