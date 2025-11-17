"use client";

import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import LoginForm from "@/components/LoginForm";
import { sampleProperties } from "@/data/properties";
import { RuralProperty } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser, setUserPreferences, setLikedProperties } = useApp();

  const handleLogin = async (nickname: string, password: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname, password }),
      });

      const data = await response.json();

      if (data.success) {
        const userId = data.user.id;
        const user = { id: userId, nickname: data.user.nickname };
        setCurrentUser(user);
        localStorage.setItem('busan-app-user', JSON.stringify(user));

        try {
          const surveyResponse = await fetch(`/api/survey?userId=${userId}`);
          const surveyData = await surveyResponse.json();

          if (surveyData.success && surveyData.data) {
            const preferences = {
              livingStyle: surveyData.data.living_style,
              socialStyle: surveyData.data.social_style,
              workStyle: surveyData.data.work_style,
              hobbyStyle: surveyData.data.hobby_style,
              pace: surveyData.data.pace,
              budget: surveyData.data.budget
            };
            setUserPreferences(preferences);
          }
        } catch (error) {
          console.error('설문 결과 불러오기 실패:', error);
        }

        try {
          const likesResponse = await fetch(`/api/likes?userId=${userId}`);
          const likesData = await likesResponse.json();

          if (likesData.success && likesData.data) {
            const savedLikes = likesData.data.map((like: any) => {
              const property = sampleProperties.find(p => p.id === like.property_id);
              if (property) {
                return { ...property, matchScore: like.match_score };
              }
              return {
                id: like.property_id,
                title: like.property_title,
                location: { district: like.property_location.split(',')[0] || '', city: like.property_location.split(',')[1] || '' },
                price: { rent: like.property_price },
                matchScore: like.match_score,
                details: { rooms: 0, size: 0, type: '', condition: '' },
                features: [],
                surroundings: { nature: [], cultural: [], convenience: [] },
                community: { population: 0, demographics: '', activities: [] }
              };
            });
            const uniqueById = new globalThis.Map<string, RuralProperty>();
            savedLikes.forEach((p: RuralProperty) => uniqueById.set(p.id, p));
            setLikedProperties(Array.from(uniqueById.values()));
          }
        } catch (error) {
          console.error('관심목록 불러오기 실패:', error);
        }

        router.push("/");
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <LoginForm
          onLogin={handleLogin}
          onBack={() => router.push("/welcome")}
          onGoToSignup={() => router.push("/signup")}
        />
      </div>
    </div>
  );
}
