"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import GuestbookEnhanced from "@/components/GuestbookEnhanced";

export default function GuestbookPage() {
  const router = useRouter();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <GuestbookEnhanced
          onBack={() => router.push("/")}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
