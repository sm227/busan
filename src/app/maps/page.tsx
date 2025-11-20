'use client';

import { useEffect, useRef, useState } from 'react';
import { RuralProperty } from '@/types';
import { useApp } from '@/contexts/AppContext';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function MapsPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [villages, setVillages] = useState<RuralProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedVillages, setSelectedVillages] = useState<RuralProperty[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<RuralProperty | null>(null);
  const { currentUser, likedProperties, setLikedProperties } = useApp();

  // 마을 데이터 불러오기 초기 한번만 api 사용
  useEffect(() => {
    const fetchAllVillages = async () => {
      setLoading(true);
      setLoadingStatus('마을 데이터 불러오는 중...');

      try {
        const response = await fetch('/api/villages');
        const data = await response.json();

        if (data.success && data.properties) {
          // 지역별 통계
          const regionStats = data.properties.reduce((acc: any, village: any) => {
            const region = village.location.district;
            acc[region] = (acc[region] || 0) + 1;
            return acc;
          }, {});

          Object.entries(regionStats).forEach(([region, count]) => {
            console.log(`   - ${region}: ${count}개`);
          });

          setVillages(data.properties);
        } else {
          // console.error('마을 데이터 로드 실패');
        }
      } catch (error) {
        // console.error('API 호출 오류:', error);
      } finally {
        setLoading(false);
        setLoadingStatus('');
      }
    };

    fetchAllVillages();
  }, []);

  // 카카오맵 초기화 및 마커 표시
  useEffect(() => {
    // 카카오맵 API 스크립트 로드
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        // 지도 옵션
        const options = {
          center: new window.kakao.maps.LatLng(36.5, 127.5), // 대한민국 중심
          level: 13, // 전국 뷰
        };

        // 지도 생성
        const map = new window.kakao.maps.Map(mapContainer.current, options);

        // console.log('카카오맵 로드 완료');

        // 마을 데이터가 로드되면 마커 표시
        if (villages.length > 0) {
          displayRegionalMarkers(map);
        }
      });
    };

    return () => {
      script.remove();
    };
  }, [villages]);

  // 지역별 마커 표시 함수
  const displayRegionalMarkers = (map: any) => {
    // console.log('=== 지역별 마커 생성 시작 ===');

    const regionCenters: { [key: string]: { lat: number; lng: number } } = {
      '서울특별시': { lat: 37.5665, lng: 126.9780 },
      '부산광역시': { lat: 35.1796, lng: 129.0756 },
      '대구광역시': { lat: 35.8714, lng: 128.6014 },
      '인천광역시': { lat: 37.4563, lng: 126.7052 },
      '광주광역시': { lat: 35.1595, lng: 126.8526 },
      '대전광역시': { lat: 36.3504, lng: 127.3845 },
      '울산광역시': { lat: 35.5384, lng: 129.3114 },
      '세종특별자치시': { lat: 36.4800, lng: 127.2890 },
      '경기도': { lat: 37.4138, lng: 127.5183 },
      '강원특별자치도': { lat: 37.8228, lng: 128.1555 },
      '충청북도': { lat: 36.8000, lng: 127.7000 },
      '충청남도': { lat: 36.5184, lng: 126.8000 },
      '전북특별자치도': { lat: 35.7175, lng: 127.1530 },
      '전라남도': { lat: 34.8679, lng: 126.9910 },
      '경상북도': { lat: 36.4919, lng: 128.8889 },
      '경상남도': { lat: 35.4606, lng: 128.2132 },
      '제주특별자치도': { lat: 33.4890, lng: 126.4983 },
    };

    // 지역별로 마을 그룹화
    const byRegion = villages.reduce((acc: any, village) => {
      const region = village.location.district;
      if (!acc[region]) acc[region] = [];
      acc[region].push(village);
      return acc;
    }, {});

    // console.log('지역별 마을 분포:');

    // 각 지역마다 마커 생성
    Object.entries(byRegion).forEach(([region, villageList]: [string, any]) => {
      const count = villageList.length;
      const center = regionCenters[region];

      if (!center) {
        // console.log(`${region}: 좌표 정보 없음 (${count}개)`);
        return;
      }

      // console.log(`${region}: ${count}개 마을`);

      // 마커 위치
      const position = new window.kakao.maps.LatLng(center.lat, center.lng);

      // 지역 이름 줄이기
      const shortName = region
        .replace('특별자치도', '')
        .replace('특별자치시', '')
        .replace('특별시', '')
        .replace('광역시', '')
        .replace('청남도', '남')
        .replace('청북도', '북')
        .replace('상남도', '남')
        .replace('상북도', '북')
        .replace('라남도', '남')
        .replace('라북도', '북')
        .replace('원도', '원')
        .replace('기도', '기')
        .replace('제주', '제주');

      // 커스텀 오버레이 HTML (마을 개수 표시)
      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
          border: 2px solid white;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s;
        " class="region-marker">
          ${shortName} +${count}
        </div>
      `;

      // 마커 클릭 이벤트
      markerElement.addEventListener('click', () => {
        // console.log(`${region} 클릭 - ${count}개 마을`);
        setSelectedRegion(region);
        setSelectedVillages(villageList);
      });

      markerElement.addEventListener('mouseover', () => {
        const div = markerElement.querySelector('.region-marker') as HTMLElement;
        if (div) div.style.transform = 'scale(1.1)';
      });

      markerElement.addEventListener('mouseout', () => {
        const div = markerElement.querySelector('.region-marker') as HTMLElement;
        if (div) div.style.transform = 'scale(1)';
      });

      // 커스텀 오버레이 생성
      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerElement,
        yAnchor: 0.5,
        zIndex: 3,
      });

      overlay.setMap(map);
    });

    // console.log('마커 생성 완료');
  };

  // 하트 버튼 클릭 핸들러
  const handleLike = async (village: RuralProperty) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    // 이미 좋아요 했는지 확인
    const isAlreadyLiked = likedProperties.some(p => p.id === village.id);

    if (isAlreadyLiked) {
      // 관심목록에서 제거
      try {
        const response = await fetch('/api/recommendations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            villageId: village.id,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setLikedProperties(likedProperties.filter(p => p.id !== village.id));
          alert('관심목록에서 제거되었습니다.');
        } else {
          alert('제거에 실패했습니다.');
        }
      } catch (error) {
        console.error('관심목록 제거 오류:', error);
        alert('오류가 발생했습니다.');
      }
      return;
    }

    // 관심목록에 추가
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          property: village,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLikedProperties([...likedProperties, village]);
        alert('관심목록에 추가되었습니다!');
      } else {
        alert('저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('관심목록 추가 오류:', error);
      alert('오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* 모바일 컨테이너 */}
      <div className="mx-auto max-w-md min-h-screen bg-white shadow-xl flex flex-col">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-800">농촌 지도</h1>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? loadingStatus : `전국 ${villages.length}개 마을`}
          </p>
        </div>

        {/* 지도 컨테이너 */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 z-10">
              <div className="text-center">
                {/* 로고 애니메이션 */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <style jsx>{`
                    @keyframes float {
                      0%, 100% { transform: translateY(0px) translateX(0px); }
                      25% { transform: translateY(-20px) translateX(10px); }
                      50% { transform: translateY(-10px) translateX(-10px); }
                      75% { transform: translateY(-15px) translateX(5px); }
                    }
                    .animate-float {
                      animation: float 3s ease-in-out infinite;
                    }
                  `}</style>
                  <img
                    src="/logo.png"
                    alt="로고"
                    className="w-full h-full object-contain animate-float"
                  />
                </div>

                <p className="text-xl font-bold text-green-700 mb-2">빈집을 찾고 있어요!</p>
                <p className="text-sm text-gray-600">{loadingStatus}</p>

                {/* 로딩 바 */}
                <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={mapContainer} className="absolute inset-0" />

          {/* 마을 상세 정보 패널 */}
          {selectedVillage && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80%] flex flex-col z-30">
              {/* 패널 헤더 */}
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedVillage(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-bold text-gray-800 flex-1 text-center">{selectedVillage.title}</h2>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(selectedVillage);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {likedProperties.some(p => p.id === selectedVillage.id) ? (
                      <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 상세 정보 내용 */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* 이미지 */}
                {selectedVillage.images && selectedVillage.images.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={selectedVillage.images[0]}
                      alt={selectedVillage.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* 위치 정보 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">위치</h3>
                  <p className="text-gray-600">
                    {selectedVillage.location.district} {selectedVillage.location.city} {selectedVillage.location.region}
                  </p>
                </div>

                {/* 가격 정보 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">가격</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.price.rent && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                        월세 {selectedVillage.price.rent.toLocaleString()}원
                      </span>
                    )}
                    {selectedVillage.price.sale && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                        매매 {(selectedVillage.price.sale / 10000).toLocaleString()}만원
                      </span>
                    )}
                    {selectedVillage.price.deposit && (
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        보증금 {(selectedVillage.price.deposit / 10000).toLocaleString()}만원
                      </span>
                    )}
                  </div>
                </div>

                {/* 주택 정보 */}
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">주택 정보</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">방</span>
                      <span className="ml-2 font-semibold text-gray-900">{selectedVillage.details.rooms}개</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">평수</span>
                      <span className="ml-2 font-semibold text-gray-900">{selectedVillage.details.size}평</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">유형</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {selectedVillage.details.type === 'hanok' ? '한옥' :
                         selectedVillage.details.type === 'modern' ? '현대주택' :
                         selectedVillage.details.type === 'farm' ? '농가주택' :
                         selectedVillage.details.type === 'apartment' ? '아파트' :
                         selectedVillage.details.type}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">상태</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        {selectedVillage.details.condition === 'excellent' ? '최상' :
                         selectedVillage.details.condition === 'good' ? '양호' :
                         selectedVillage.details.condition === 'needs-repair' ? '수리필요' :
                         selectedVillage.details.condition}
                      </span>
                    </div>
                    {selectedVillage.details.yearBuilt && (
                      <div className="bg-gray-50 p-2 rounded col-span-2">
                        <span className="text-gray-500">건축년도</span>
                        <span className="ml-2 font-semibold text-gray-900">{selectedVillage.details.yearBuilt}년</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 특징 */}
                {selectedVillage.features && selectedVillage.features.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">특징</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVillage.features.map((feature, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주변 환경 */}
                {selectedVillage.surroundings && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">주변 환경</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 space-y-1">
                      {selectedVillage.surroundings.naturalFeatures && selectedVillage.surroundings.naturalFeatures.length > 0 && (
                        <p>자연: {selectedVillage.surroundings.naturalFeatures.join(', ')}</p>
                      )}
                      {selectedVillage.surroundings.nearbyFacilities && selectedVillage.surroundings.nearbyFacilities.length > 0 && (
                        <p>편의시설: {selectedVillage.surroundings.nearbyFacilities.join(', ')}</p>
                      )}
                      {selectedVillage.surroundings.transportation && selectedVillage.surroundings.transportation.length > 0 && (
                        <p>교통: {selectedVillage.surroundings.transportation.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 마을 정보 */}
                {selectedVillage.communityInfo && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">마을 정보</h3>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 space-y-1">
                      {selectedVillage.communityInfo.population && (
                        <p>인구: {selectedVillage.communityInfo.population}명</p>
                      )}
                      {selectedVillage.communityInfo.averageAge && (
                        <p>평균 연령: {selectedVillage.communityInfo.averageAge}세</p>
                      )}
                      {selectedVillage.communityInfo.mainIndustries && selectedVillage.communityInfo.mainIndustries.length > 0 && (
                        <p>주요 산업: {selectedVillage.communityInfo.mainIndustries.join(', ')}</p>
                      )}
                      {selectedVillage.communityInfo.culturalActivities && selectedVillage.communityInfo.culturalActivities.length > 0 && (
                        <p>문화 활동: {selectedVillage.communityInfo.culturalActivities.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 지역별 마을 목록 패널 */}
          {selectedRegion && selectedVillages.length > 0 && !selectedVillage && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80%] flex flex-col z-20">
              {/* 패널 헤더 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">{selectedRegion}</h2>
                    <p className="text-sm text-gray-600">{selectedVillages.length}개 마을</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedRegion(null);
                      setSelectedVillages([]);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 마을 목록 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedVillages.map((village, index) => {
                  const isLiked = likedProperties.some(p => p.id === village.id);

                  return (
                    <div
                      key={village.id || index}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors relative"
                    >
                      {/* 하트 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(village);
                        }}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white transition-colors"
                      >
                        {isLiked ? (
                          <svg className="w-6 h-6 text-red-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        )}
                      </button>

                      <div
                        onClick={() => {
                          setSelectedVillage(village);
                        }}
                        className="cursor-pointer pr-12"
                      >
                        <h3 className="font-bold text-gray-800 mb-1">{village.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {village.location.city} {village.location.region}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {village.price.rent && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                              월세 {village.price.rent.toLocaleString()}원
                            </span>
                          )}
                          {village.price.sale && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              매매 {(village.price.sale / 10000).toLocaleString()}만원
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}