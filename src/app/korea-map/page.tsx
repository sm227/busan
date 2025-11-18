"use client";

import { useRouter } from "next/navigation";
import KakaoKoreaMap from "@/components/KakaoKoreaMap";

export default function KoreaMapPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <KakaoKoreaMap onBack={() => router.push("/")} />
      </div>
    </div>
  );
}
