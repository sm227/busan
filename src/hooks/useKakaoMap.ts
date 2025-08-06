import { useEffect, useState, useRef } from 'react';

interface UseKakaoMapProps {
  center?: {
    lat: number;
    lng: number;
  };
  level?: number;
}

export const useKakaoMap = ({ 
  center = { lat: 36.5, lng: 127.5 }, // 한국 중앙
  level = 13 // 전국이 보이는 레벨
}: UseKakaoMapProps = {}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadKakaoMapScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.kakao?.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&libraries=services,clusterer,drawing&autoload=false`;
        script.async = true;
        
        script.onload = () => {
          window.kakao.maps.load(() => {
            resolve();
          });
        };
        
        script.onerror = () => {
          reject(new Error('카카오맵 스크립트 로드 실패'));
        };
        
        document.head.appendChild(script);
      });
    };

    const initializeMap = async () => {
      try {
        await loadKakaoMapScript();
        
        if (!mapRef.current) return;

        const mapOption = {
          center: new window.kakao.maps.LatLng(center.lat, center.lng),
          level: level
        };

        const kakaoMap = new window.kakao.maps.Map(mapRef.current, mapOption);
        setMap(kakaoMap);
        setIsLoaded(true);
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error);
      }
    };

    initializeMap();
  }, [center.lat, center.lng, level]);

  return {
    mapRef,
    map,
    isLoaded
  };
};