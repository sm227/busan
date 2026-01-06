'use client';

import React, { useState } from 'react';

type AnalyticsTab = 'occupation' | 'living_style' | 'budget' | 'trend';

interface AthenaManagementProps {
  userId: number;
}

interface OccupationStat {
  occupation: string;
  living_style: string;
  work_style: string;
  social_style: string;
  count: string;
}

interface LivingStyleStat {
  living_style: string;
  count: string;
  percentage: string;
}

interface BudgetStat {
  budget: string;
  count: string;
  percentage: string;
}

interface TrendStat {
  year: string;
  month: string;
  responses: string;
  unique_users: string;
}

export function AthenaManagement({ userId }: AthenaManagementProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('occupation');
  const [loading, setLoading] = useState(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<Record<AnalyticsTab, boolean>>({
    occupation: false,
    living_style: false,
    budget: false,
    trend: false,
  });
  const [isCached, setIsCached] = useState<Record<AnalyticsTab, boolean>>({
    occupation: false,
    living_style: false,
    budget: false,
    trend: false,
  });
  const [cachedAt, setCachedAt] = useState<Record<AnalyticsTab, Date | null>>({
    occupation: null,
    living_style: null,
    budget: null,
    trend: null,
  });

  const [occupationData, setOccupationData] = useState<OccupationStat[]>([]);
  const [livingStyleData, setLivingStyleData] = useState<LivingStyleStat[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetStat[]>([]);
  const [trendData, setTrendData] = useState<TrendStat[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cacheHistory, setCacheHistory] = useState<Array<{
    id: string;
    queryType: string;
    createdAt: Date;
    updatedAt: Date;
  }>>([]);

  // 캐시 히스토리 불러오기
  const fetchCacheHistory = React.useCallback(async () => {
    try {
      const response = await fetch('/api/analytics/cache-history');
      const result = await response.json();
      if (result.success) {
        setCacheHistory(result.data.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })));
      }
    } catch (err) {
      console.error('Failed to fetch cache history:', err);
    }
  }, []);

  const fetchOccupationStats = async (refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = refresh ? '/api/analytics/occupation?refresh=true' : '/api/analytics/occupation';
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setOccupationData(result.data || []);
        setHasAnalyzed(prev => ({ ...prev, occupation: true }));
        setIsCached(prev => ({ ...prev, occupation: result.cached || false }));
        setCachedAt(prev => ({ ...prev, occupation: result.cachedAt ? new Date(result.cachedAt) : null }));
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLivingStyleStats = async (refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/analytics/stats?type=living_style${refresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setLivingStyleData(result.data || []);
        setHasAnalyzed(prev => ({ ...prev, living_style: true }));
        setIsCached(prev => ({ ...prev, living_style: result.cached || false }));
        setCachedAt(prev => ({ ...prev, living_style: result.cachedAt ? new Date(result.cachedAt) : null }));
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetStats = async (refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/analytics/stats?type=budget${refresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setBudgetData(result.data || []);
        setHasAnalyzed(prev => ({ ...prev, budget: true }));
        setIsCached(prev => ({ ...prev, budget: result.cached || false }));
        setCachedAt(prev => ({ ...prev, budget: result.cachedAt ? new Date(result.cachedAt) : null }));
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrendStats = async (refresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/analytics/stats?type=trend${refresh ? '&refresh=true' : ''}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setTrendData(result.data || []);
        setHasAnalyzed(prev => ({ ...prev, trend: true }));
        setIsCached(prev => ({ ...prev, trend: result.cached || false }));
        setCachedAt(prev => ({ ...prev, trend: result.cachedAt ? new Date(result.cachedAt) : null }));
      } else {
        setError(result.error || '데이터를 불러오는데 실패했습니다.');
      }
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    const refresh = hasAnalyzed[activeTab]; // 이미 분석한 적 있으면 refresh=true

    switch (activeTab) {
      case 'occupation':
        await fetchOccupationStats(refresh);
        break;
      case 'living_style':
        await fetchLivingStyleStats(refresh);
        break;
      case 'budget':
        await fetchBudgetStats(refresh);
        break;
      case 'trend':
        await fetchTrendStats(refresh);
        break;
    }

    // 분석 완료 후 캐시 히스토리 갱신
    fetchCacheHistory();
  };

  // 컴포넌트 마운트 시 모든 탭의 캐시 데이터 자동 로드
  React.useEffect(() => {
    console.log('AthenaManagement mounted');
    fetchOccupationStats(false);
    fetchLivingStyleStats(false);
    fetchBudgetStats(false);
    fetchTrendStats(false);
    fetchCacheHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 직업별 데이터 그룹화
  const groupedData = occupationData.reduce((acc, item) => {
    if (!acc[item.occupation]) {
      acc[item.occupation] = [];
    }
    acc[item.occupation].push(item);
    return acc;
  }, {} as Record<string, OccupationStat[]>);

  const tabs = [
    { id: 'occupation' as AnalyticsTab, label: '직업별 선호' },
    { id: 'living_style' as AnalyticsTab, label: '라이프스타일 분포' },
    { id: 'budget' as AnalyticsTab, label: '예산 분포' },
    { id: 'trend' as AnalyticsTab, label: '월별 트렌드' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">설문 통계 분석 (Athena)</h1>
        <p className="text-gray-500 text-sm">Athena 기반 데이터 분석 (쿼리 실행 시 과금)</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-700">
          <nav className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setError(null);
                }}
                className={`px-4 py-2 border-b-2 text-sm ${
                  activeTab === tab.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Analyze Button */}
      <div className="mb-6">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="px-4 py-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed text-sm font-medium"
        >
          {loading ? '분석 중...' : hasAnalyzed[activeTab] ? (isCached[activeTab] ? '갱신 (Athena 쿼리)' : '다시 분석') : '분석 시작'}
        </button>
        {!hasAnalyzed[activeTab] && !loading && (
          <p className="text-xs text-gray-500 mt-2">
            * 캐시된 데이터가 있으면 즉시 표시, 없으면 Athena 쿼리 실행
          </p>
        )}
        {hasAnalyzed[activeTab] && isCached[activeTab] && !loading && (
          <p className="text-xs text-gray-500 mt-2">
            * 캐시된 데이터 표시 중. 갱신 버튼 클릭 시 Athena 쿼리 실행 (과금)
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-gray-700 bg-gray-900">
          <p className="text-white font-medium mb-1">오류 발생</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500 mt-2">
            Athena 테이블이 생성되지 않았거나 S3에 데이터가 없을 수 있습니다.
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-2 border-gray-700 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">분석 중</p>
          <p className="text-xs text-gray-600 mt-1">최대 30초 소요</p>
        </div>
      )}

      {/* Content based on active tab */}
      {!loading && !error && hasAnalyzed[activeTab] && (
        <>
          {/* Occupation Tab */}
          {activeTab === 'occupation' && occupationData.length > 0 && (
            <div className="border border-gray-700 bg-gray-900">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-bold text-white">직업별 선호 스타일</h2>
            </div>

            {Object.keys(groupedData).length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>데이터 없음</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">직업</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Living</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Work</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Social</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">응답</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {Object.entries(groupedData).map(([occupation, items]) => (
                      <React.Fragment key={occupation}>
                        <tr className="bg-gray-950">
                          <td colSpan={5} className="px-4 py-2 text-sm text-white">
                            {occupation} ({items.reduce((sum, item) => sum + parseInt(item.count), 0)}명)
                          </td>
                        </tr>
                        {items.slice(0, 5).map((item, idx) => (
                          <tr key={`${occupation}-${idx}`}>
                            <td className="px-4 py-2 text-sm text-gray-600"></td>
                            <td className="px-4 py-2 text-sm text-gray-400">{item.living_style}</td>
                            <td className="px-4 py-2 text-sm text-gray-400">{item.work_style}</td>
                            <td className="px-4 py-2 text-sm text-gray-400">{item.social_style}</td>
                            <td className="px-4 py-2 text-sm text-right text-white">{item.count}</td>
                          </tr>
                        ))}
                        {items.length > 5 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-2 text-xs text-center text-gray-600">
                              +{items.length - 5}개
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            </div>
          )}

          {/* Living Style Tab */}
          {activeTab === 'living_style' && livingStyleData.length > 0 && (
            <div className="border border-gray-700 bg-gray-900">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">라이프스타일 분포</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">스타일</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">응답</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">비율</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {livingStyleData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-white">{item.living_style}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-400">{item.count}</td>
                        <td className="px-4 py-2 text-sm text-right text-white">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Budget Tab */}
          {activeTab === 'budget' && budgetData.length > 0 && (
            <div className="border border-gray-700 bg-gray-900">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">예산 분포</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">예산</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">응답</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">비율</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {budgetData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-white">{item.budget}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-400">{item.count}</td>
                        <td className="px-4 py-2 text-sm text-right text-white">{item.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trend Tab */}
          {activeTab === 'trend' && trendData.length > 0 && (
            <div className="border border-gray-700 bg-gray-900">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">월별 트렌드</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">기간</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">응답</th>
                      <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">사용자</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {trendData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-2 text-sm text-white">{item.year}.{item.month}</td>
                        <td className="px-4 py-2 text-sm text-right text-gray-400">{item.responses}</td>
                        <td className="px-4 py-2 text-sm text-right text-white">{item.unique_users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </>
      )}

      {/* Empty State - No Data Yet */}
      {!loading && !error && !hasAnalyzed[activeTab] && (
        <div className="border border-gray-700 bg-gray-900 p-12 text-center">
          <p className="text-sm text-gray-500">분석 버튼을 클릭하세요</p>
        </div>
      )}

      {/* Database Cache History */}
      {!loading && !error && hasAnalyzed[activeTab] && cacheHistory.filter(c => c.queryType === activeTab).length > 0 && (
        <div className="mt-6 border border-gray-700 bg-gray-900">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-sm font-bold text-white">데이터베이스 캐시 히스토리 ({activeTab})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-black">
                <tr>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase">쿼리 타입</th>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase">생성 시간</th>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase">갱신 시간</th>
                  <th className="px-4 py-3 text-left text-gray-500 uppercase">ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {cacheHistory
                  .filter(cache => cache.queryType === activeTab)
                  .map((cache) => (
                    <tr key={cache.id}>
                      <td className="px-4 py-2 text-white">{cache.queryType}</td>
                      <td className="px-4 py-2 text-gray-400">
                        {cache.createdAt.toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-2 text-gray-400">
                        {cache.updatedAt.toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-2 text-gray-600 font-mono text-xs">{cache.id.slice(0, 8)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
