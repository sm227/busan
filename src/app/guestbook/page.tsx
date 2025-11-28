"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import GuestbookEnhanced from "@/components/GuestbookEnhanced";

function GuestbookContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useApp();

  const initialTab = searchParams.get('tab') as 'list' | 'write' | 'bookmarks' | 'myActivity' | null;

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <GuestbookEnhanced
          onBack={() => router.push("/")}
          currentUser={currentUser}
          initialTab={initialTab || undefined}
        />
      </div>
    </div>
  );
}

export default function GuestbookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <GuestbookContent />
    </Suspense>
  );
}
