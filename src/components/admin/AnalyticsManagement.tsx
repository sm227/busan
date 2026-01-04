'use client';

import { useState } from 'react';
import { SurveyAnalytics } from '@/app/api/analytics/survey/route';

interface AnalyticsManagementProps {
  userId: number;
}

export function AnalyticsManagement({ userId }: AnalyticsManagementProps) {
  const [analytics, setAnalytics] = useState<SurveyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 분석 결과 조회
  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/analytics/survey');
      const result = await response.json();

      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error || '분석 결과를 불러올 수 없습니다.');
      }
    } catch (err: any) {
      setError('분석 결과 조회 중 오류가 발생했습니다.');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 분석 파이프라인 트리거
  const triggerAnalytics = async () => {
    setIsTriggering(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/trigger-analytics', {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        setSuccessMessage(
          `분석이 시작되었습니다. Job Run ID: ${result.data.glue.jobRunId.substring(0, 20)}...`
        );
        // 5초 후 자동으로 결과 조회
        setTimeout(() => {
          fetchAnalytics();
        }, 5000);
      } else {
        setError(result.error || '분석 파이프라인 실행에 실패했습니다.');
      }
    } catch (err: any) {
      setError('분석 실행 중 오류가 발생했습니다.');
      console.error('Error triggering analytics:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">설문 분석 (AWS Glue)</h1>
          <p className="text-sm text-gray-400 mt-1">
            설문조사 데이터를 AWS Glue로 분석하고 인사이트를 확인하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '조회 중...' : '결과 조회'}
          </button>
          <button
            onClick={triggerAnalytics}
            disabled={isTriggering}
            className="px-4 py-2 bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTriggering ? '실행 중...' : '분석 시작'}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="p-4 bg-green-900/30 border border-green-700 text-green-300 text-sm">
          ✅ {successMessage}
          <br />
          <span className="text-xs text-green-400">
            Glue Job이 완료되면 결과가 표시됩니다 (약 30초 소요)
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/30 border border-red-700 text-red-300 text-sm">
          ❌ {error}
        </div>
      )}

      {/* Analytics Results */}
      {analytics && (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 border border-gray-700 p-6">
              <div className="text-gray-400 text-sm mb-2">총 설문 응답</div>
              <div className="text-3xl font-bold text-gray-100">
                {analytics.total_surveys.toLocaleString()}건
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 p-6">
              <div className="text-gray-400 text-sm mb-2">생성 시간</div>
              <div className="text-lg text-gray-100">
                {new Date(analytics.generated_at).toLocaleString('ko-KR')}
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 p-6">
              <div className="text-gray-400 text-sm mb-2">인사이트</div>
              <div className="text-3xl font-bold text-gray-100">
                {analytics.insights.length}개
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gray-800 border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">💡 주요 인사이트</h2>
            <ul className="space-y-2">
              {analytics.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-300">
                  <span className="text-blue-400">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preference Distribution */}
          <div className="bg-gray-800 border border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-100 mb-4">📊 선호도 분포</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(analytics.preference_distribution).map(([category, values]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-gray-300 mb-3">
                    {getCategoryLabel(category)}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(values as Record<string, number>)
                      .sort(([, a], [, b]) => b - a)
                      .map(([value, count]) => {
                        const percentage = ((count / analytics.total_surveys) * 100).toFixed(1);
                        return (
                          <div key={value} className="flex items-center gap-3">
                            <div className="text-sm text-gray-400 w-32">{value}</div>
                            <div className="flex-1 bg-gray-700 h-6 relative">
                              <div
                                className="bg-blue-600 h-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-end px-2">
                                <span className="text-xs text-white font-semibold">
                                  {count}명 ({percentage}%)
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupation Distribution */}
          {analytics.occupation_distribution.top_occupations &&
            analytics.occupation_distribution.top_occupations.length > 0 && (
              <div className="bg-gray-800 border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-100 mb-4">💼 직업 분포 (상위 10개)</h2>
                <div className="space-y-2">
                  {analytics.occupation_distribution.top_occupations.map((item, index) => {
                    const total = analytics.occupation_distribution.total_with_occupation || 1;
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className="text-sm text-gray-400 w-4">{index + 1}</div>
                        <div className="text-sm text-gray-300 w-40">{item.occupation}</div>
                        <div className="flex-1 bg-gray-700 h-6 relative">
                          <div
                            className="bg-green-600 h-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-end px-2">
                            <span className="text-xs text-white font-semibold">
                              {item.count}명 ({percentage}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Daily Trends */}
          {analytics.trends.daily_submissions &&
            Object.keys(analytics.trends.daily_submissions).length > 0 && (
              <div className="bg-gray-800 border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-100 mb-4">📈 일별 응답 추이</h2>
                <div className="space-y-2">
                  {Object.entries(analytics.trends.daily_submissions)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .slice(-14) // 최근 14일
                    .map(([date, count]) => (
                      <div key={date} className="flex items-center gap-3">
                        <div className="text-sm text-gray-400 w-28">{date}</div>
                        <div className="flex-1 bg-gray-700 h-6 relative">
                          <div
                            className="bg-purple-600 h-full transition-all"
                            style={{
                              width: `${(count / Math.max(...Object.values(analytics.trends.daily_submissions as Record<string, number>))) * 100}%`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center justify-end px-2">
                            <span className="text-xs text-white font-semibold">{count}건</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* Empty State */}
      {!analytics && !isLoading && !error && (
        <div className="bg-gray-800 border border-gray-700 p-12 text-center">
          <div className="text-gray-400 mb-4">분석 결과가 없습니다</div>
          <p className="text-sm text-gray-500 mb-6">
            "분석 시작" 버튼을 클릭하여 설문 데이터를 분석하거나,
            <br />
            "결과 조회" 버튼으로 기존 분석 결과를 확인하세요.
          </p>
          <button
            onClick={triggerAnalytics}
            className="px-6 py-3 bg-green-600 text-white hover:bg-green-700"
          >
            분석 시작하기
          </button>
        </div>
      )}
    </div>
  );
}

// Helper function to get Korean labels for categories
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    living_style: '생활 스타일',
    social_style: '사회 스타일',
    work_style: '직업 스타일',
    hobby_style: '취미 스타일',
    pace: '생활 페이스',
    budget: '예산',
    purchase_type: '구매 유형',
  };
  return labels[category] || category;
}
