"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import CoinShop from "@/components/CoinShop";

export default function CoinPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <CoinShop
          onBack={() => router.back()}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}