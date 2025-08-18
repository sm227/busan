'use client';

import { useEffect } from 'react';

export default function ScrollbarInit() {
  useEffect(() => {
    // 페이지 로드 시 스크롤바 설정
    const initScrollbar = () => {
      const html = document.documentElement;
      
      // 최신 브라우저에서 scrollbar-gutter 지원 확인
      if (CSS.supports('scrollbar-gutter', 'stable')) {
        console.log('✅ scrollbar-gutter 지원: 최신 해결책 적용');
        html.style.scrollbarGutter = 'stable';
        html.style.overflowY = 'auto';
      } else {
        console.log('⚠️ scrollbar-gutter 미지원: 폴백 해결책 적용');
        html.style.overflowY = 'scroll';
      }
      
      // 가로 스크롤 방지
      html.style.overflowX = 'hidden';
      
      // 부드러운 스크롤
      html.style.scrollBehavior = 'smooth';
    };

    // DOM이 완전히 로드된 후 실행
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initScrollbar);
    } else {
      initScrollbar();
    }

    // 정리 함수
    return () => {
      document.removeEventListener('DOMContentLoaded', initScrollbar);
    };
  }, []);

  return null; // 렌더링할 내용 없음
}