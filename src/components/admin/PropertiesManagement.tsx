'use client';

import { useEffect, useState, useRef } from 'react';

interface PropertiesManagementProps {
  userId: number;
  onNavigateToUser?: (userId: number) => void;
  initialOwnerId?: number | null;
}

interface PropertyItem {
  id: string;
  title: string;
  description: string;
  district: string;
  city: string;
  region: string | null;
  address: string | null;
  rent: number | null;
  sale: number | null;
  deposit: number | null;
  rooms: number;
  size: number;
  type: string;
  yearBuilt: number | null;
  condition: string;
  features: string[];
  contact: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    nickname: string;
  };
  images: Array<{
    id: string;
    url: string;
    order: number;
    isPrimary: boolean;
  }>;
}

interface PropertyDetail extends PropertyItem {
  user: {
    id: number;
    nickname: string;
    role: string;
    createdAt: string;
    _count: {
      userProperties: number;
    };
  };
}

export function PropertiesManagement({ userId, onNavigateToUser, initialOwnerId }: PropertiesManagementProps) {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 20;

  // Detail modal
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // 필터 초기화 중인지 추적하는 ref
  const isInitializingRef = useRef(false);

  // 다른 모듈에서 특정 사용자를 선택하여 왔을 때
  useEffect(() => {
    if (initialOwnerId) {
      isInitializingRef.current = true;
      setOwnerFilter(initialOwnerId.toString());
      setOffset(0);
      setTimeout(() => {
        isInitializingRef.current = false;
      }, 0);
    }
  }, [initialOwnerId]);

  // 필터 변경 시 offset 리셋
  useEffect(() => {
    if (!isInitializingRef.current) {
      setOffset(0);
    }
  }, [statusFilter, searchQuery, districtFilter, cityFilter, typeFilter, ownerFilter]);

  // 데이터 fetch
  useEffect(() => {
    if (!isInitializingRef.current) {
      fetchProperties();
    }
  }, [statusFilter, searchQuery, districtFilter, cityFilter, typeFilter, ownerFilter, offset]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userId: userId.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (districtFilter && districtFilter !== 'all') params.append('district', districtFilter);
      if (cityFilter && cityFilter !== 'all') params.append('city', cityFilter);
      if (typeFilter && typeFilter !== 'all') params.append('type', typeFilter);
      if (ownerFilter) params.append('ownerId', ownerFilter);

      const response = await fetch(`/api/admin/properties?${params.toString()}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '데이터 조회에 실패했습니다.');
      }

      setProperties(data.data);
      setTotal(data.total);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyDetail = async (propertyId: string) => {
    setIsLoadingDetail(true);
    try {
      const response = await fetch(`/api/admin/properties/${propertyId}?userId=${userId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '매물 정보를 불러오는데 실패했습니다.');
      }

      setSelectedProperty(data.data);
      setShowDetailModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : '매물 상세 정보 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleStatusChange = async (propertyId: string, newStatus: string) => {
    if (!confirm(`매물 상태를 "${getStatusLabel(newStatus)}"로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '상태 변경에 실패했습니다.');
      }

      alert('상태가 변경되었습니다.');
      fetchProperties();
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedProperty(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('정말로 이 매물을 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/properties/${propertyId}?userId=${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '삭제에 실패했습니다.');
      }

      alert('매물이 삭제되었습니다.');
      fetchProperties();
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedProperty(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      active: '활성',
      inactive: '비활성',
      sold: '거래완료',
      deleted: '삭제됨'
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const colors: { [key: string]: string } = {
      active: 'bg-green-900 text-green-200 border-green-700',
      inactive: 'bg-gray-700 text-gray-300 border-gray-600',
      sold: 'bg-blue-900 text-blue-200 border-blue-700',
      deleted: 'bg-red-900 text-red-200 border-red-700'
    };
    return (
      <span className={`px-2 py-1 text-xs border rounded ${colors[status] || 'bg-gray-700 text-gray-300'}`}>
        {getStatusLabel(status)}
      </span>
    );
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '-';
    if (price >= 10000) {
      return `${(price / 10000).toFixed(1)}억`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}천만`;
    }
    return `${price}만원`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">빈집 매물 관리</h2>
          <p className="text-sm text-gray-400 mt-1">전체 {total}개 매물</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">상태</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="">전체</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
              <option value="sold">거래완료</option>
              <option value="deleted">삭제됨</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">지역</label>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="all">전체</option>
              <option value="강서구">강서구</option>
              <option value="금정구">금정구</option>
              <option value="기장군">기장군</option>
              <option value="남구">남구</option>
              <option value="동구">동구</option>
              <option value="동래구">동래구</option>
              <option value="부산진구">부산진구</option>
              <option value="북구">북구</option>
              <option value="사상구">사상구</option>
              <option value="사하구">사하구</option>
              <option value="서구">서구</option>
              <option value="수영구">수영구</option>
              <option value="연제구">연제구</option>
              <option value="영도구">영도구</option>
              <option value="중구">중구</option>
              <option value="해운대구">해운대구</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">매물 유형</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm focus:outline-none focus:border-gray-500"
            >
              <option value="all">전체</option>
              <option value="단독주택">단독주택</option>
              <option value="다가구주택">다가구주택</option>
              <option value="아파트">아파트</option>
              <option value="빌라">빌라</option>
              <option value="상가">상가</option>
              <option value="토지">토지</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">검색</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제목, 설명, 주소 검색..."
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="w-48">
            <label className="block text-xs text-gray-400 mb-1">등록자 ID</label>
            <input
              type="text"
              value={ownerFilter}
              onChange={(e) => setOwnerFilter(e.target.value)}
              placeholder="사용자 ID"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-gray-100 text-sm placeholder-gray-500 focus:outline-none focus:border-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">로딩 중...</div>
        ) : properties.length === 0 ? (
          <div className="p-8 text-center text-gray-400">매물이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-750 border-b border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">ID</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">제목</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">지역</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">유형</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">가격</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">등록자</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">상태</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">등록일</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-300 text-xs">{property.id.slice(0, 8)}...</td>
                    <td className="px-4 py-3 text-gray-100 max-w-xs truncate">{property.title}</td>
                    <td className="px-4 py-3 text-gray-300">{property.district} {property.city}</td>
                    <td className="px-4 py-3 text-gray-300">{property.type}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {property.sale ? `매매 ${formatPrice(property.sale)}` :
                       property.rent ? `월세 ${formatPrice(property.rent)}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {onNavigateToUser ? (
                        <button
                          onClick={() => onNavigateToUser(property.user.id)}
                          className="text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          {property.user.nickname}
                        </button>
                      ) : (
                        <span className="text-gray-300">{property.user.nickname}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(property.status)}</td>
                    <td className="px-4 py-3 text-gray-300">
                      {new Date(property.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => fetchPropertyDetail(property.id)}
                          disabled={isLoadingDetail}
                          className="px-2 py-1 text-xs bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 disabled:opacity-50"
                        >
                          상세
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <div className="border-t border-gray-700 px-4 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {offset + 1} - {Math.min(offset + limit, total)} / 전체 {total}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-100">매물 상세 정보</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedProperty(null);
                }}
                className="text-gray-400 hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">기본 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">ID</p>
                    <p className="text-gray-100">{selectedProperty.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">상태</p>
                    <div className="mt-1">{getStatusBadge(selectedProperty.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">제목</p>
                    <p className="text-gray-100 text-lg font-semibold">{selectedProperty.title}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400">설명</p>
                    <p className="text-gray-100 whitespace-pre-wrap">{selectedProperty.description}</p>
                  </div>
                </div>
              </div>

              {/* Location & Property Details */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">위치 및 매물 정보</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">지역</p>
                    <p className="text-gray-100">{selectedProperty.district}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">도시</p>
                    <p className="text-gray-100">{selectedProperty.city}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">상세 지역</p>
                    <p className="text-gray-100">{selectedProperty.region || '-'}</p>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <p className="text-gray-400">주소</p>
                    <p className="text-gray-100">{selectedProperty.address || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">유형</p>
                    <p className="text-gray-100">{selectedProperty.type}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">방 개수</p>
                    <p className="text-gray-100">{selectedProperty.rooms}개</p>
                  </div>
                  <div>
                    <p className="text-gray-400">평수</p>
                    <p className="text-gray-100">{selectedProperty.size}평</p>
                  </div>
                  <div>
                    <p className="text-gray-400">건축년도</p>
                    <p className="text-gray-100">{selectedProperty.yearBuilt || '-'}년</p>
                  </div>
                  <div>
                    <p className="text-gray-400">상태</p>
                    <p className="text-gray-100">{selectedProperty.condition}</p>
                  </div>
                </div>
              </div>

              {/* Price Info */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">가격 정보</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">매매가</p>
                    <p className="text-gray-100 text-lg font-semibold">{formatPrice(selectedProperty.sale)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">월세</p>
                    <p className="text-gray-100 text-lg font-semibold">{formatPrice(selectedProperty.rent)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">보증금</p>
                    <p className="text-gray-100 text-lg font-semibold">{formatPrice(selectedProperty.deposit)}</p>
                  </div>
                </div>
              </div>

              {/* Features */}
              {selectedProperty.features && selectedProperty.features.length > 0 && (
                <div className="bg-gray-750 border border-gray-700 p-4">
                  <h4 className="text-lg font-bold text-gray-100 mb-3">특징</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.features.map((feature, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm border border-gray-600">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {selectedProperty.images && selectedProperty.images.length > 0 && (
                <div className="bg-gray-750 border border-gray-700 p-4">
                  <h4 className="text-lg font-bold text-gray-100 mb-3">이미지 ({selectedProperty.images.length})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProperty.images.map((image) => (
                      <div key={image.id} className="aspect-video bg-gray-700 border border-gray-600 overflow-hidden">
                        <img src={image.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Info */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">등록자 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">닉네임</p>
                    {onNavigateToUser ? (
                      <button
                        onClick={() => {
                          setShowDetailModal(false);
                          onNavigateToUser(selectedProperty.user.id);
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        {selectedProperty.user.nickname}
                      </button>
                    ) : (
                      <p className="text-gray-100">{selectedProperty.user.nickname}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400">등록 매물 수</p>
                    <p className="text-gray-100">{selectedProperty.user._count.userProperties}개</p>
                  </div>
                  <div>
                    <p className="text-gray-400">연락처</p>
                    <p className="text-gray-100">{selectedProperty.contact}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">가입일</p>
                    <p className="text-gray-100">
                      {new Date(selectedProperty.user.createdAt).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">등록 정보</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">등록일</p>
                    <p className="text-gray-100">
                      {new Date(selectedProperty.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">수정일</p>
                    <p className="text-gray-100">
                      {new Date(selectedProperty.updatedAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-750 border border-gray-700 p-4">
                <h4 className="text-lg font-bold text-gray-100 mb-3">관리 작업</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProperty.status !== 'active' && (
                    <button
                      onClick={() => handleStatusChange(selectedProperty.id, 'active')}
                      className="px-4 py-2 bg-green-700 text-green-100 border border-green-600 hover:bg-green-600"
                    >
                      활성화
                    </button>
                  )}
                  {selectedProperty.status !== 'inactive' && (
                    <button
                      onClick={() => handleStatusChange(selectedProperty.id, 'inactive')}
                      className="px-4 py-2 bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600"
                    >
                      비활성화
                    </button>
                  )}
                  {selectedProperty.status !== 'sold' && (
                    <button
                      onClick={() => handleStatusChange(selectedProperty.id, 'sold')}
                      className="px-4 py-2 bg-blue-700 text-blue-100 border border-blue-600 hover:bg-blue-600"
                    >
                      거래완료
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedProperty.id)}
                    className="px-4 py-2 bg-red-700 text-red-100 border border-red-600 hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
