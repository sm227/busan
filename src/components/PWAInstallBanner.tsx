'use client';

import { useState, useEffect } from 'react';
import { X, Download, Share } from 'lucide-react';

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 이전에 배너를 닫았는지 확인
    const bannerDismissed = localStorage.getItem('pwa-banner-dismissed');
    if (bannerDismissed) {
      return;
    }

    // iOS Safari 감지
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator as any).standalone;

    setIsIOS(isIOSDevice);

    // iOS Safari에서 이미 설치된 경우 배너 숨김
    if (isIOSDevice && isInStandaloneMode) {
      return;
    }

    // iOS Safari는 beforeinstallprompt 없이 바로 배너 표시
    if (isIOSDevice) {
      setShowBanner(true);
      return;
    }

    // Android/Chrome - PWA 설치 프롬프트 이벤트 리스너
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS는 자동 설치 불가, 배너 유지 (사용자가 직접 공유 버튼 사용)
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA 설치 완료');
    }

    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isIOS ? (
            <Share className="w-4 h-4 flex-shrink-0" />
          ) : (
            <Download className="w-4 h-4 flex-shrink-0" />
          )}
          <p className="text-sm font-medium truncate">
            {isIOS
              ? '공유 버튼을 눌러 "홈 화면에 추가"를 선택하세요'
              : '앱으로 설치하고 더 편하게 이용하세요'
            }
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-3 py-1 bg-white text-green-600 rounded-full text-xs font-semibold hover:bg-green-50 transition-colors"
            >
              설치
            </button>
          )}
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="배너 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
