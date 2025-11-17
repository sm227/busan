"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import MyPage from "@/components/MyPage";

export default function MyPagePage() {
  const router = useRouter();
  const { currentUser, handleLogout } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <MyPage
          onBack={() => router.push("/")}
          currentUser={currentUser}
          onLogout={() => {
            handleLogout();
            router.push("/welcome");
          }}
        />
      </div>
    </div>
  );
}
