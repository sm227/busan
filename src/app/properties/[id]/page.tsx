"use client";

import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, MapPin, Phone, Home as HomeIcon } from "lucide-react";
import { sampleProperties } from "@/data/properties";

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { setSelectedProperty } = useApp();

  const property = sampleProperties.find(p => p.id === params.id);

  if (!property) {
    return (
      <div className="min-h-screen bg-slate-50 overflow-x-hidden">
        <div className="max-w-md mx-auto bg-white min-h-screen relative flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">매물을 찾을 수 없습니다.</p>
            <button
              onClick={() => router.push("/results")}
              className="btn-primary"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleContact = () => {
    setSelectedProperty(property);
    router.push(`/properties/${property.id}/contact`);
  };

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <div className="min-h-screen bg-emerald-50/30">
          <div className="px-6 pb-8">
            <div className="flex items-center py-6 mb-6">
              <button
                onClick={() => router.push("/results")}
                className="back-button"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>돌아가기</span>
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <div className="card p-6">
                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                  {property.title}
                </h1>
                <div className="flex items-center text-slate-600 mb-4">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="font-medium">
                    {property.location.district},{" "}
                    {property.location.city}
                  </span>
                </div>

                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  월 {property.price.rent?.toLocaleString()}원
                </div>
                {property.price.deposit && (
                  <div className="text-slate-600 font-medium">
                    보증금{" "}
                    {(property.price.deposit / 10000).toFixed(0)}
                    만원
                  </div>
                )}
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">기본 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">방/평수:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.rooms}룸 ·{" "}
                      {property.details.size}평
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">유형:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.type}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">상태:</span>
                    <span className="text-slate-900 font-semibold">
                      {property.details.condition}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-slate-900 mb-4 text-lg">특징</h3>
                <div className="flex flex-wrap gap-3">
                  {property.features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-emerald-100 rounded-full text-sm text-emerald-700 font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 pb-8">
              <button
                onClick={handleContact}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-4"
              >
                <Phone className="w-5 h-5" />
                <span>연락하기</span>
              </button>
              <button
                onClick={() => router.push("/")}
                className="btn-secondary w-full flex items-center justify-center space-x-2 py-4"
              >
                <HomeIcon className="w-5 h-5" />
                <span>홈으로</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
