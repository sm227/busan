'use client';

import { ReactNode } from 'react';
import { useState } from 'react';
import { AdminModule } from '@/app/admin/page';

interface AdminLayoutProps {
  userId: number;
  currentModule: AdminModule;
  onModuleChange: (module: AdminModule) => void;
  onLogout: () => void;
  children: ReactNode;
}

interface NavItem {
  id: AdminModule;
  label: string;
  badge?: number;
}

export function AdminLayout({
  userId,
  currentModule,
  onModuleChange,
  onLogout,
  children,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: '대시보드' },
    { id: 'users', label: '회원 관리' },
    { id: 'classes', label: '원데이 클래스' },
    { id: 'properties', label: '빈집 매물' },
    { id: 'community', label: '커뮤니티' },
    { id: 'coins', label: '코인 관리' },
    { id: 'chat', label: '채팅방 관리' },
    { id: 'badges', label: '뱃지 관리' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-800 border-r border-gray-700 flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="h-14 border-b border-gray-700 flex items-center justify-between px-4">
          {isSidebarOpen && (
            <div>
              <h2 className="font-bold text-gray-100">빈집다방 관리자</h2>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 text-gray-400 hover:text-gray-200"
          >
            {isSidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onModuleChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm border-b border-gray-700 ${
                currentModule === item.id
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-750'
              }`}
            >
              {isSidebarOpen && (
                <span>{item.label}</span>
              )}
              {item.badge && isSidebarOpen && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-700 p-4">
          <button
            onClick={onLogout}
            className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 text-sm border border-gray-600"
          >
            {isSidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-900">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
