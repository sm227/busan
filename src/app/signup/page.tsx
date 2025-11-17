"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import UserInfoForm from "@/components/UserInfoForm";

export default function SignupPage() {
  const router = useRouter();
  const { setCurrentUser } = useApp();

  const handleUserInfoSubmit = async (nickname: string, password: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();

      if (data.success) {
        const user = { id: data.userId, nickname };
        setCurrentUser(user);
        localStorage.setItem('busan-app-user', JSON.stringify(user));
        router.push("/questionnaire");
      } else {
        alert(data.error || '사용자 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('사용자 생성 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <UserInfoForm
          onSubmit={handleUserInfoSubmit}
          onBack={() => router.push("/welcome")}
        />
      </div>
    </div>
  );
}
