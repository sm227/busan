"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import { ArrowLeft, Home as HomeIcon, X, Upload } from "lucide-react";
import Image from "next/image";

export default function NewTradePage() {
  const router = useRouter();
  const { currentUser } = useApp();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    district: "",
    city: "",
    region: "",
    address: "",
    sale: "",
    rent: "",
    deposit: "",
    rooms: "",
    size: "",
    type: "단독주택",
    yearBuilt: "",
    condition: "양호",
    contact: "",
    features: [] as string[],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // 최대 5개까지만 허용
    const remainingSlots = 5 - selectedImages.length;
    const newFiles = fileArray.slice(0, remainingSlots);

    // 미리보기 생성
    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      alert('로그인이 필요합니다');
      router.push('/welcome');
      return;
    }

    if (!formData.title || !formData.district || !formData.city || !formData.contact) {
      alert('필수 항목을 모두 입력해주세요');
      return;
    }

    try {
      setIsSubmitting(true);

      // 이미지 업로드
      let uploadedImageUrls: string[] = [];
      if (selectedImages.length > 0) {
        setIsUploading(true);
        const uploadFormData = new FormData();
        selectedImages.forEach((file) => {
          uploadFormData.append('images', file);
        });

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success) {
          uploadedImageUrls = uploadData.data.urls;
        }
        setIsUploading(false);
      }

      const response = await fetch('/api/user-properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: formData.title,
          description: formData.description,
          district: formData.district,
          city: formData.city,
          region: formData.region || null,
          address: formData.address || null,
          sale: formData.sale ? parseInt(formData.sale) : null,
          rent: formData.rent ? parseInt(formData.rent) : null,
          deposit: formData.deposit ? parseInt(formData.deposit) : null,
          rooms: parseInt(formData.rooms) || 0,
          size: parseInt(formData.size) || 0,
          type: formData.type,
          yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
          condition: formData.condition,
          images: uploadedImageUrls,
          features: formData.features,
          contact: formData.contact,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('매물이 등록되었습니다');
        router.push('/trade');
      } else {
        alert(data.error || '매물 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('매물 등록 실패:', error);
      alert('매물 등록에 실패했습니다');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">로그인이 필요합니다</p>
          <button
            onClick={() => router.push('/welcome')}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-medium"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0] overflow-x-hidden font-sans text-stone-800">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-xl">

        {/* 헤더 */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-stone-500 hover:bg-stone-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="font-serif font-bold text-lg text-stone-800">매물 등록</span>
            <div className="w-10" />
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-6 pb-24 space-y-6">

          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">기본 정보</h3>

            <div>
              <label className="block text-sm text-stone-600 mb-2">제목 *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="예) 한적한 시골 단독주택 매매"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-stone-600 mb-2">상세 설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="매물에 대한 상세한 설명을 입력해주세요"
                rows={4}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">위치 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-600 mb-2">시/도 *</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="예) 강원도"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-2">시/군/구 *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="예) 평창군"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone-600 mb-2">읍/면/동</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="예) 봉평면"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <div>
              <label className="block text-sm text-stone-600 mb-2">상세 주소</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="선택 사항"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">가격 정보 (단위: 만원)</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-600 mb-2">매매가</label>
                <input
                  type="number"
                  name="sale"
                  value={formData.sale}
                  onChange={handleChange}
                  placeholder="5000"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-2">월세</label>
                <input
                  type="number"
                  name="rent"
                  value={formData.rent}
                  onChange={handleChange}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone-600 mb-2">보증금</label>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                placeholder="500"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
          </div>

          {/* 사진 업로드 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">매물 사진 (최대 5장)</h3>

            {/* 이미지 미리보기 그리드 */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-stone-200">
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 파일 업로드 버튼 */}
            {selectedImages.length < 5 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors">
                <Upload className="w-8 h-8 text-stone-400 mb-2" />
                <span className="text-sm text-stone-500">사진 추가하기</span>
                <span className="text-xs text-stone-400 mt-1">
                  {selectedImages.length}/5
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* 상세 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">상세 정보</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-600 mb-2">방 개수</label>
                <input
                  type="number"
                  name="rooms"
                  value={formData.rooms}
                  onChange={handleChange}
                  placeholder="3"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-2">평수</label>
                <input
                  type="number"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="30"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-stone-600 mb-2">주택 유형</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="단독주택">단독주택</option>
                <option value="전원주택">전원주택</option>
                <option value="한옥">한옥</option>
                <option value="농가주택">농가주택</option>
                <option value="기타">기타</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-stone-600 mb-2">건축년도</label>
                <input
                  type="number"
                  name="yearBuilt"
                  value={formData.yearBuilt}
                  onChange={handleChange}
                  placeholder="2010"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
              <div>
                <label className="block text-sm text-stone-600 mb-2">상태</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                >
                  <option value="최상">최상</option>
                  <option value="양호">양호</option>
                  <option value="리모델링 필요">리모델링 필요</option>
                </select>
              </div>
            </div>
          </div>

          {/* 연락처 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">연락처</h3>

            <div>
              <label className="block text-sm text-stone-600 mb-2">전화번호 *</label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                required
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full py-4 bg-stone-800 text-white rounded-xl text-lg font-semibold hover:bg-stone-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isUploading ? '사진 업로드 중...' : isSubmitting ? '등록 중...' : '매물 등록하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
