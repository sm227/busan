'use client';

import { useEffect, useRef, useState } from 'react';
import { RuralProperty } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { ListFilter, X, Heart, MapPin, Home, Trees, Users, Loader, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

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

  // 1. 데이터 로드
  useEffect(() => {
    const fetchAllVillages = async () => {
      setLoading(true);
      setLoadingStatus('전국 빈집 데이터 수집 중...');

      try {
        const response = await fetch('/api/villages');
        const data = await response.json();

        if (data.success && data.properties) {
          setVillages(data.properties);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setTimeout(() => {
          setLoading(false);
          setLoadingStatus('');
        }, 1500);
      }
    };

    fetchAllVillages();
  }, []);

  // 2. 카카오맵 초기화
  useEffect(() => {
    if (loading) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapContainer.current) return;

        const options = {
          center: new window.kakao.maps.LatLng(36.5, 127.5),
          level: 13,
        };

        const map = new window.kakao.maps.Map(mapContainer.current, options);

        if (villages.length > 0) {
          displayRegionalMarkers(map);
        }
      });
    };

    return () => {
      script.remove();
    };
  }, [villages, loading]);

  // 3. 마커 표시
  const displayRegionalMarkers = (map: any) => {
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

    const byRegion = villages.reduce((acc: any, village) => {
      const region = village.location.district;
      if (!acc[region]) acc[region] = [];
      acc[region].push(village);
      return acc;
    }, {});

    Object.entries(byRegion).forEach(([region, villageList]: [string, any]) => {
      const count = villageList.length;
      const center = regionCenters[region];

      if (!center) return;

      const position = new window.kakao.maps.LatLng(center.lat, center.lng);
      const shortName = region.substring(0, 2);

      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
        <div style="
          background-color: white;
          color: #292524;
          padding: 6px 12px;
          border-radius: 20px;
          font-family: sans-serif;
          font-weight: 700;
          font-size: 13px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          border: 1px solid #e7e5e4;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: transform 0.2s;
        " class="region-marker">
          <span>${shortName}</span>
          <span style="color: #f97316; font-weight: 800;">${count}</span>
        </div>
      `;

      markerElement.addEventListener('click', () => {
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

      const overlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerElement,
        yAnchor: 0.5,
        zIndex: 3,
      });

      overlay.setMap(map);
    });
  };

  const handleLike = async (village: RuralProperty) => {
    if (!currentUser) {
      alert('로그인이 필요합니다.');
      return;
    }

    const isAlreadyLiked = likedProperties.some(p => p.id === village.id);

    try {
      if (isAlreadyLiked) {
        const response = await fetch('/api/recommendations', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, villageId: village.id }),
        });
        if ((await response.json()).success) {
          setLikedProperties(likedProperties.filter(p => p.id !== village.id));
        }
      } else {
        const response = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id, property: village }),
        });
        if ((await response.json()).success) {
          setLikedProperties([...likedProperties, village]);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F0] font-sans text-stone-800">
      <div className="mx-auto max-w-md min-h-screen bg-white shadow-xl flex flex-col relative">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 px-4 py-4">
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-stone-100 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="p-1 rounded-full hover:bg-stone-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-stone-800" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-stone-800 leading-none">대동여지도</h1>
                <p className="text-[10px] text-stone-400 mt-0.5">
                   {loading ? "데이터 수신 중..." : `전국 ${villages.length}곳의 빈집`}
                </p>
              </div>
            </div>
            <div className="bg-stone-100 p-2 rounded-full text-stone-400 hover:text-stone-800 cursor-pointer">
               <ListFilter className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-stone-100">
          
          {/* 로딩 애니메이션 */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F5F5F0] z-30">
              <style jsx>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-15px); }
                }
                .animate-float {
                  animation: float 3s ease-in-out infinite;
                }
              `}</style>
              <div className="relative w-28 h-28 mb-6 animate-float">
                <Image
                  src="/logo.png"
                  alt="로딩중"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <p className="text-lg font-serif font-bold text-stone-800 mb-1">빈집을 찾고 있어요</p>
              <p className="text-xs text-stone-500">{loadingStatus}</p>
            </div>
          )}

          <div ref={mapContainer} className="absolute inset-0" />

          {/* 1. 상세 정보 패널 (기존 내용 복구 + 디자인 적용) */}
          {selectedVillage && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85%] flex flex-col z-40 animate-in slide-in-from-bottom duration-300">
              
              {/* Handle Bar */}
              <div className="w-full flex justify-center pt-3 pb-1">
                 <div className="w-12 h-1 bg-stone-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-6 py-3 flex items-start justify-between border-b border-stone-50">
                <div className="flex-1">
                   <h2 className="text-xl font-serif font-bold text-stone-800 mb-1">{selectedVillage.title}</h2>
                   <p className="text-xs text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> 
                      {selectedVillage.location.district} {selectedVillage.location.city}
                   </p>
                </div>
                <div className="flex gap-2">
                   <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLike(selectedVillage);
                      }}
                      className="p-2.5 rounded-full bg-stone-50 hover:bg-orange-50 transition-colors group"
                    >
                      <Heart 
                        className={`w-5 h-5 transition-colors ${
                          likedProperties.some(p => p.id === selectedVillage.id) 
                            ? 'text-orange-500 fill-orange-500' 
                            : 'text-stone-400 group-hover:text-orange-400'
                        }`} 
                      />
                    </button>
                    <button
                      onClick={() => setSelectedVillage(null)}
                      className="p-2.5 rounded-full bg-stone-50 hover:bg-stone-100 text-stone-400 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                </div>
              </div>

              {/* Content Scroll (기존 데이터 항목 모두 복구) */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                
                {/* 이미지 */}
                {selectedVillage.images && selectedVillage.images.length > 0 ? (
                  <div className="relative w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden border border-stone-100">
                    <img src={selectedVillage.images[0]} alt={selectedVillage.title} className="w-full h-full object-cover" />
                  </div>
                ) : null}

                {/* 위치 정보 (텍스트) */}
                <div>
                   <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">LOCATION</h3>
                   <p className="text-sm font-bold text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      {selectedVillage.location.district} {selectedVillage.location.city} {selectedVillage.location.region}
                   </p>
                </div>

                {/* 가격 정보 */}
                <div>
                  <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">PRICE</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVillage.price.rent && (
                      <span className="bg-stone-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
                        월세 {selectedVillage.price.rent.toLocaleString()}원
                      </span>
                    )}
                    {selectedVillage.price.sale && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-orange-200">
                        매매 {(selectedVillage.price.sale / 10000).toLocaleString()}만원
                      </span>
                    )}
                    {selectedVillage.price.deposit && (
                      <span className="bg-white border border-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-sm font-medium">
                        보증금 {(selectedVillage.price.deposit / 10000).toLocaleString()}만원
                      </span>
                    )}
                  </div>
                </div>

                {/* 주택 정보 (그리드) */}
                <div>
                  <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">DETAILS</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: '방 개수', value: `${selectedVillage.details.rooms}개` },
                      { label: '면적', value: `${selectedVillage.details.size}평` },
                      { label: '유형', value: selectedVillage.details.type === 'hanok' ? '한옥' : selectedVillage.details.type },
                      { label: '상태', value: selectedVillage.details.condition },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                        <span className="text-[10px] text-stone-400 block mb-0.5">{item.label}</span>
                        <span className="text-sm font-bold text-stone-700">{item.value}</span>
                      </div>
                    ))}
                    {selectedVillage.details.yearBuilt && (
                      <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 col-span-2">
                        <span className="text-[10px] text-stone-400 block mb-0.5">건축년도</span>
                        <span className="text-sm font-bold text-stone-700">{selectedVillage.details.yearBuilt}년</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 특징 */}
                {selectedVillage.features && selectedVillage.features.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">FEATURES</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVillage.features.map((feature, idx) => (
                        <span key={idx} className="bg-white border border-stone-200 text-stone-600 px-3 py-1 rounded-full text-xs font-medium">
                          #{feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 주변 환경 (기존 정보 복구) */}
                {selectedVillage.surroundings && (
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                       <Trees className="w-3 h-3" /> SURROUNDINGS
                    </h3>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm text-stone-600 space-y-2">
                      {selectedVillage.surroundings.naturalFeatures && selectedVillage.surroundings.naturalFeatures.length > 0 && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">자연</span> {selectedVillage.surroundings.naturalFeatures.join(', ')}</p>
                      )}
                      {selectedVillage.surroundings.nearbyFacilities && selectedVillage.surroundings.nearbyFacilities.length > 0 && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">시설</span> {selectedVillage.surroundings.nearbyFacilities.join(', ')}</p>
                      )}
                      {selectedVillage.surroundings.transportation && selectedVillage.surroundings.transportation.length > 0 && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">교통</span> {selectedVillage.surroundings.transportation.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 마을 정보 (기존 정보 복구) */}
                {selectedVillage.communityInfo && (
                  <div>
                    <h3 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider flex items-center gap-1">
                       <Users className="w-3 h-3" /> COMMUNITY
                    </h3>
                    <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 text-sm text-stone-600 space-y-2">
                      {selectedVillage.communityInfo.population && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">인구</span> {selectedVillage.communityInfo.population}명</p>
                      )}
                      {selectedVillage.communityInfo.averageAge && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">연령</span> {selectedVillage.communityInfo.averageAge}세</p>
                      )}
                      {selectedVillage.communityInfo.mainIndustries && selectedVillage.communityInfo.mainIndustries.length > 0 && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">산업</span> {selectedVillage.communityInfo.mainIndustries.join(', ')}</p>
                      )}
                      {selectedVillage.communityInfo.culturalActivities && selectedVillage.communityInfo.culturalActivities.length > 0 && (
                        <p><span className="font-bold text-stone-400 text-xs mr-2">활동</span> {selectedVillage.communityInfo.culturalActivities.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* 2. 지역별 목록 패널 (기존 유지) */}
          {selectedRegion && selectedVillages.length > 0 && !selectedVillage && (
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[60%] flex flex-col z-30 animate-in slide-in-from-bottom duration-300">
              <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
                <div>
                   <h2 className="text-lg font-serif font-bold text-stone-800">{selectedRegion}</h2>
                   <p className="text-xs text-stone-500">{selectedVillages.length}개의 마을을 찾았어요</p>
                </div>
                <button onClick={() => setSelectedRegion(null)} className="p-2 bg-stone-50 rounded-full hover:bg-stone-100 transition-colors">
                   <X className="w-4 h-4 text-stone-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFBF7]">
                {selectedVillages.map((village, index) => {
                  const isLiked = likedProperties.some(p => p.id === village.id);
                  return (
                    <div
                      key={village.id || index}
                      onClick={() => setSelectedVillage(village)}
                      className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm active:scale-[0.99] transition-transform flex gap-4 cursor-pointer"
                    >
                       <div className="w-20 h-20 bg-stone-100 rounded-xl shrink-0 overflow-hidden">
                          {village.images?.[0] ? (
                            <img src={village.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-stone-300"><Home className="w-6 h-6" /></div>
                          )}
                       </div>
                       
                       <div className="flex-1 min-w-0 relative">
                          <h3 className="font-bold text-stone-800 text-sm mb-1 truncate pr-6">{village.title}</h3>
                          <p className="text-xs text-stone-500 mb-3">{village.location.city} {village.location.region}</p>
                          
                          <div className="flex items-center gap-2">
                             {village.price.rent && <span className="text-xs font-bold text-orange-600">월 {village.price.rent.toLocaleString()}</span>}
                             {village.price.sale && <span className="text-xs font-bold text-stone-800">매매 {(village.price.sale / 10000).toLocaleString()}만</span>}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(village);
                            }}
                            className="absolute top-0 right-0"
                          >
                             <Heart className={`w-4 h-4 ${isLiked ? 'text-orange-500 fill-orange-500' : 'text-stone-300'}`} />
                          </button>
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