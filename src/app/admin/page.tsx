'use client';

import { useEffect, useState } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { UsersManagement } from '@/components/admin/UsersManagement';
import { ClassesManagement } from '@/components/admin/ClassesManagement';
import { PropertiesManagement } from '@/components/admin/PropertiesManagement';
import { CommunityManagement } from '@/components/admin/CommunityManagement';
import { CoinsManagement } from '@/components/admin/CoinsManagement';
import { ChatManagement } from '@/components/admin/ChatManagement';
import { BadgesManagement } from '@/components/admin/BadgesManagement';
import { AthenaManagement } from '@/components/admin/AthenaManagement';
import { AnalyticsManagement } from '@/components/admin/AnalyticsManagement';

export type AdminModule =
  | 'dashboard'
  | 'users'
  | 'classes'
  | 'properties'
  | 'community'
  | 'coins'
  | 'chat'
  | 'badges'
  | 'athena'
  | 'analytics';

export default function AdminPage() {
  const [userId, setUserId] = useState<number | null>(null);
  const [currentModule, setCurrentModule] = useState<AdminModule>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<number | null>(null);
  const [selectedPropertyOwnerId, setSelectedPropertyOwnerId] = useState<number | null>(null);

  useEffect(() => {
    const savedUserId = localStorage.getItem('adminUserId');
    if (savedUserId) {
      setUserId(parseInt(savedUserId));
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (uid: number) => {
    setUserId(uid);
    localStorage.setItem('adminUserId', uid.toString());
  };

  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem('adminUserId');
    setCurrentModule('dashboard');
  };

  const handleNavigateToUser = (targetUserId: number) => {
    setSelectedUserId(targetUserId);
    setSelectedInstructorId(null);
    setSelectedPropertyOwnerId(null);
    setCurrentModule('users');
  };

  const handleNavigateToInstructorClasses = (instructorId: number) => {
    setSelectedInstructorId(instructorId);
    setSelectedUserId(null);
    setSelectedPropertyOwnerId(null);
    setCurrentModule('classes');
  };

  const handleNavigateToUserProperties = (ownerId: number) => {
    setSelectedPropertyOwnerId(ownerId);
    setSelectedUserId(null);
    setSelectedInstructorId(null);
    setCurrentModule('properties');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (!userId) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <AdminLayout
      userId={userId}
      currentModule={currentModule}
      onModuleChange={(module) => {
        setCurrentModule(module);
        // 다른 모듈로 이동할 때만 선택 상태 초기화
        if (module !== 'users') setSelectedUserId(null);
        if (module !== 'classes') setSelectedInstructorId(null);
        if (module !== 'properties') setSelectedPropertyOwnerId(null);
      }}
      onLogout={handleLogout}
    >
      {currentModule === 'dashboard' && <Dashboard userId={userId} onNavigate={setCurrentModule} />}
      {currentModule === 'users' && (
        <UsersManagement
          userId={userId}
          initialSelectedUserId={selectedUserId}
          onClearSelection={() => setSelectedUserId(null)}
          onNavigateToInstructorClasses={handleNavigateToInstructorClasses}
          onNavigateToUserProperties={handleNavigateToUserProperties}
        />
      )}
      {currentModule === 'classes' && (
        <ClassesManagement
          userId={userId}
          onNavigateToUser={handleNavigateToUser}
          initialInstructorId={selectedInstructorId}
        />
      )}
      {currentModule === 'properties' && (
        <PropertiesManagement
          userId={userId}
          onNavigateToUser={handleNavigateToUser}
          initialOwnerId={selectedPropertyOwnerId}
        />
      )}
      {currentModule === 'community' && <CommunityManagement userId={userId} />}
      {currentModule === 'coins' && <CoinsManagement userId={userId} />}
      {currentModule === 'chat' && <ChatManagement userId={userId} />}
      {currentModule === 'badges' && <BadgesManagement userId={userId} />}
      {currentModule === 'athena' && <AthenaManagement userId={userId} />}
      {currentModule === 'analytics' && <AnalyticsManagement userId={userId} />}
    </AdminLayout>
  );
}
