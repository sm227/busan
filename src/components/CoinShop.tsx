'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface CoinShopProps {
  onBack: () => void;
  currentUser?: { id: number; nickname: string } | null;
}

type TabType = 'purchase' | 'history' | 'free' | 'usage';

interface CookiePackage {
  id: string;
  amount: number;
  bonus?: number;
  price: number;
  isEvent?: boolean;
}

const eventPackage: CookiePackage = {
  id: 'event-200',
  amount: 200,
  bonus: 10,
  price: 24000,
  isEvent: true
};

const regularPackages: CookiePackage[] = [
  { id: 'cookie-10', amount: 10, price: 1200 },
  { id: 'cookie-30', amount: 30, price: 3600 },
  { id: 'cookie-50', amount: 50, price: 6000 },
  { id: 'cookie-100', amount: 100, price: 12000 },
  { id: 'cookie-200', amount: 200, price: 24000 },
  { id: 'cookie-300', amount: 300, price: 36000 },
];

export default function CoinShop({ onBack, currentUser }: CoinShopProps) {
  const [activeTab, setActiveTab] = useState<TabType>('purchase');
  const [currentCoins, setCurrentCoins] = useState(0);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const tabs = [
    { id: 'purchase' as TabType, label: '코인구매' },
    { id: 'history' as TabType, label: '구매내역' },
    { id: 'free' as TabType, label: '무료코인' },
    { id: 'usage' as TabType, label: '사용내역' },
  ];

  // 코인 정보 로드
  useEffect(() => {
    if (currentUser) {
      fetchCoinData();
    }
  }, [currentUser]);

  const fetchCoinData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/coins?userId=${currentUser.id}&action=all`);
      const data = await response.json();

      if (data.success) {
        setCurrentCoins(data.data.balance);
        setPurchases(data.data.purchases || []);
        setTransactions(data.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch coin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (pkg: CookiePackage) => {
    if (!currentUser) {
      setMessage({ type: 'error', text: '로그인이 필요합니다.' });
      return;
    }

    if (purchasing) return;

    try {
      setPurchasing(true);
      const response = await fetch('/api/coins/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: pkg.amount,
          bonusAmount: pkg.bonus || 0,
          price: pkg.price,
          paymentMethod: 'card'
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `코인 ${pkg.amount}개를 구매했습니다!` });
        setCurrentCoins(data.data.newBalance);
        await fetchCoinData(); // 구매 내역 갱신

        // 메시지 3초 후 자동 제거
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || '구매에 실패했습니다.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setMessage({ type: 'error', text: '구매 중 오류가 발생했습니다.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  const handleAdWatch = async () => {
    if (!currentUser) {
      setMessage({ type: 'error', text: '로그인이 필요합니다.' });
      return;
    }

    try {
      setPurchasing(true);
      const response = await fetch('/api/coins/ad-reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: `코인 5개를 획득했습니다! (남은 횟수: ${data.data.remainingAds})` });
        setCurrentCoins(data.data.newBalance);
        await fetchCoinData();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || '광고 보상을 받을 수 없습니다.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Ad reward error:', error);
      setMessage({ type: 'error', text: '광고 보상 처리 중 오류가 발생했습니다.' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white min-h-screen relative flex flex-col">

        {/* Header */}
        <div className="sticky top-0 z-20 bg-white px-6 py-4 flex items-center justify-center border-b border-stone-100">
          <button
            onClick={onBack}
            className="absolute left-6 text-stone-400 hover:text-stone-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-stone-900">코인샵</h1>
        </div>

        {/* Tabs */}
        <div className="sticky top-[61px] z-10 bg-white border-b border-stone-100">
          <div className="flex items-center justify-around px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 px-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-orange-500'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-10">
          {activeTab === 'purchase' && (
            <div className="p-6 space-y-6">
              {/* Current Coins */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">🪙</span>
                  <span className="text-stone-700 text-sm">
                    현재 보유한 코인 <span className="text-orange-500 font-bold">{currentCoins}개</span>
                  </span>
                </div>
                <button className="text-stone-400 hover:text-stone-600 transition-colors">
                  <span className="text-sm">코인이란?</span>
                </button>
              </div>

              {/* Ad Banner */}
              <div>
                <h2 className="text-stone-900 text-base font-bold mb-3">무료 코인 받기</h2>
                <button
                  onClick={handleAdWatch}
                  disabled={purchasing}
                  className="w-full relative bg-gradient-to-br from-orange-50 via-orange-100 to-yellow-100 rounded-2xl p-6 overflow-hidden border border-orange-200 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-4 right-4 text-4xl rotate-12">🪙</div>
                    <div className="absolute bottom-4 left-4 text-2xl -rotate-12">✨</div>
                    <div className="absolute top-1/2 left-1/3 text-3xl -rotate-6">📺</div>
                  </div>

                  {/* Content */}
                  <div className="relative flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-orange-900 text-lg font-black mb-2">광고 보고 코인 받기!</p>
                      <p className="text-orange-800 text-sm font-bold">
                        30초 광고 시청하고 <span className="text-orange-600">코인 5개 획득</span>
                      </p>
                      <p className="text-orange-700 text-xs mt-2 font-medium">
                        💫 매일 3회까지 가능
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="relative">
                        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-4xl">▶️</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Regular Packages */}
              <div>
                <h2 className="text-stone-900 text-base font-bold mb-3">일반 패키지</h2>
                <div className="space-y-3">
                  {regularPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center justify-between hover:border-stone-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🪙</span>
                        <span className="text-stone-800 text-sm font-medium">코인 {pkg.amount}개</span>
                      </div>
                      <button
                        onClick={() => handlePurchase(pkg)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
                      >
                        ₩{pkg.price.toLocaleString()}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              {purchases.length > 0 ? (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="bg-white border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🪙</span>
                          <span className="text-sm font-bold text-stone-800">
                            코인 {purchase.amount}개{purchase.bonusAmount > 0 && ` + ${purchase.bonusAmount}`}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-stone-800">₩{purchase.price.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-stone-400">
                        {new Date(purchase.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-stone-400 text-sm">구매 내역이 없습니다</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'free' && (
            <div className="p-6">
              <div className="text-center py-20">
                <p className="text-stone-400 text-sm">무료로 받을 수 있는 코인이 없습니다</p>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="p-6">
              {transactions.filter(t => t.type === 'usage').length > 0 ? (
                <div className="space-y-3">
                  {transactions.filter(t => t.type === 'usage').map((tx) => (
                    <div key={tx.id} className="bg-white border border-stone-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-stone-800">{tx.description}</span>
                        <span className="text-sm font-bold text-red-600">-{Math.abs(tx.amount)}개</span>
                      </div>
                      <div className="text-xs text-stone-400">
                        {new Date(tx.createdAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <p className="text-stone-400 text-sm">사용 내역이 없습니다</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toast Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div className={`px-6 py-3 rounded-xl shadow-lg ${
                message.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}>
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {purchasing && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-40">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}