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
  const [map, setMap] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadKakaoMapScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.kakao?.maps) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
        if (!apiKey) {
          reject(new Error('카카오맵 API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요'));
          return;
        }
        
        console.log('카카오맵 API 키 확인됨:', apiKey.substring(0, 10) + '...');
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer,drawing&autoload=false`;
        script.async = true;
        
        script.onload = () => {
          if (window.kakao?.maps) {
            window.kakao.maps.load(() => {
              resolve();
            });
          } else {
            reject(new Error('카카오맵 스크립트가 로드되었지만 kakao.maps 객체를 찾을 수 없습니다'));
          }
        };
        
        script.onerror = (error) => {
          console.error('카카오맵 스크립트 로드 에러:', error);
          reject(new Error('카카오맵 스크립트 로드 실패: 네트워크 오류 또는 잘못된 API 키'));
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
        setError(error instanceof Error ? error.message : '카카오맵 로드 실패');
      }
    };

    initializeMap();
  }, [center.lat, center.lng, level]);

  return {
    mapRef,
    map,
    isLoaded,
    error
  };
};