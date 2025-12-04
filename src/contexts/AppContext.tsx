"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserPreferences, RuralProperty } from "@/types";
import { sampleProperties } from "@/data/properties";

interface CurrentUser {
  id: number;
  nickname: string;
}

interface AppContextType {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  userPreferences: Partial<UserPreferences>;
  setUserPreferences: (preferences: Partial<UserPreferences>) => void;
  likedProperties: RuralProperty[];
  setLikedProperties: (properties: RuralProperty[]) => void;
  rejectedProperties: RuralProperty[];
  setRejectedProperties: (properties: RuralProperty[]) => void;
  recommendations: RuralProperty[];
  setRecommendations: (properties: RuralProperty[]) => void;
  selectedProperty: RuralProperty | null;
  setSelectedProperty: (property: RuralProperty | null) => void;
  selectedPost: any;
  setSelectedPost: (post: any) => void;
  showPostModal: boolean;
  setShowPostModal: (show: boolean) => void;
  isInitialized: boolean;
  handleLogout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [userPreferences, setUserPreferences] = useState<Partial<UserPreferences>>({});
  const [likedProperties, setLikedProperties] = useState<RuralProperty[]>([]);
  const [rejectedProperties, setRejectedProperties] = useState<RuralProperty[]>([]);
  const [recommendations, setRecommendations] = useState<RuralProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<RuralProperty | null>(null);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // 로그인 상태 복원
  useEffect(() => {
    const restoreLoginState = async () => {
      try {
        const savedUser = localStorage.getItem('busan-app-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);

          // 사용자의 설문 결과 불러오기
          try {
            const surveyResponse = await fetch(`/api/survey?userId=${user.id}`);
            const surveyData = await surveyResponse.json();

            if (surveyData.success && surveyData.data) {
              const preferences = {
                occupation: surveyData.data.occupation,
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

          // 관심목록 불러오기 recommendations
          try {
            const recommendationsResponse = await fetch(`/api/recommendations?userId=${user.id}`);
            const recommendationsData = await recommendationsResponse.json();

            if (recommendationsData.success && recommendationsData.data) {
              setLikedProperties(recommendationsData.data);
              // console.log('DB에서 관심목록 로드:', recommendationsData.data.length, '개');
            }
          } catch (error) {
            // console.error('관심목록 불러오기 실패:', error);
          }
        }
      } catch (error) {
        console.error('로그인 상태 복원 실패:', error);
        localStorage.removeItem('busan-app-user');
      } finally {
        setIsInitialized(true);
      }
    };

    restoreLoginState();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('busan-app-user');
    setCurrentUser(null);
    setUserPreferences({});
    setLikedProperties([]);
    setRejectedProperties([]);
    setRecommendations([]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        userPreferences,
        setUserPreferences,
        likedProperties,
        setLikedProperties,
        rejectedProperties,
        setRejectedProperties,
        recommendations,
        setRecommendations,
        selectedProperty,
        setSelectedProperty,
        selectedPost,
        setSelectedPost,
        showPostModal,
        setShowPostModal,
        isInitialized,
        handleLogout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
