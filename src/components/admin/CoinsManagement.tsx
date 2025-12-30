'use client';

interface CoinsManagementProps {
  userId: number;
}

export function CoinsManagement({ userId }: CoinsManagementProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-gray-700 pb-4">
        <h1 className="text-2xl font-bold text-gray-100">코인 관리</h1>
        <p className="text-gray-400 mt-1">코인 거래 및 구매 내역 관리</p>
      </div>

      <div className="bg-yellow-900 border border-yellow-700 p-4 text-yellow-200 text-sm">
        코인 관리 API가 아직 구현되지 않았습니다. /api/admin/coins 엔드포인트를 구현해주세요.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">총 발행 코인</p>
          <p className="text-2xl font-bold text-gray-100">-</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">총 매출</p>
          <p className="text-2xl font-bold text-gray-100">-</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">총 구매 건수</p>
          <p className="text-2xl font-bold text-gray-100">-</p>
        </div>

        <div className="bg-gray-800 border border-gray-700 p-4">
          <p className="text-sm text-gray-400">광고 보상</p>
          <p className="text-2xl font-bold text-gray-100">-</p>
        </div>
      </div>
    </div>
  );
}
