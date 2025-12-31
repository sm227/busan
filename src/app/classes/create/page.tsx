"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus } from "lucide-react";
import { useApp } from "@/contexts/AppContext";

export default function CreateClassPage() {
  const router = useRouter();
  const { currentUser } = useApp();
  const [loading, setLoading] = useState(false);

  // 기본 정보
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("farming");
  const [difficulty, setDifficulty] = useState("beginner");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");

  // 위치 정보
  const [province, setProvince] = useState("부산광역시");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [locationDetail, setLocationDetail] = useState("");

  // 추가 정보
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [materials, setMaterials] = useState<string[]>([]);
  const [materialInput, setMaterialInput] = useState("");
  const [includes, setIncludes] = useState<string[]>([]);
  const [includeInput, setIncludeInput] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");

  const categoryLabels: Record<string, string> = {
    farming: "농사 체험",
    crafts: "공예",
    cooking: "요리",
    culture: "문화",
    nature: "자연"
  };

  const difficultyLabels: Record<string, string> = {
    beginner: "초급",
    intermediate: "중급",
    advanced: "고급"
  };

  const provinces = [
    "부산광역시",
    "서울특별시",
    "인천광역시",
    "대구광역시",
    "광주광역시",
    "대전광역시",
    "울산광역시",
    "세종특별자치시",
    "경기도",
    "강원도",
    "충청북도",
    "충청남도",
    "전라북도",
    "전라남도",
    "경상북도",
    "경상남도",
    "제주특별자치도"
  ];

  const addMaterial = () => {
    if (materialInput.trim()) {
      setMaterials([...materials, materialInput.trim()]);
      setMaterialInput("");
    }
  };

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const addInclude = () => {
    if (includeInput.trim()) {
      setIncludes([...includes, includeInput.trim()]);
      setIncludeInput("");
    }
  };

  const removeInclude = (index: number) => {
    setIncludes(includes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!title.trim() || !description.trim() || !price || !duration) {
      alert("필수 정보를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          title: title.trim(),
          description: description.trim(),
          category,
          difficulty,
          price: parseInt(price),
          duration: parseInt(duration),
          province,
          city: city.trim(),
          district: district.trim(),
          address: address.trim(),
          locationDetail: locationDetail.trim(),
          thumbnailUrl: thumbnailUrl.trim() || null,
          materials,
          includes,
          minAge: minAge ? parseInt(minAge) : null,
          maxAge: maxAge ? parseInt(maxAge) : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("클래스가 등록되었습니다!");
        router.push(`/classes/${data.classId}`);
      } else {
        alert(data.error || "클래스 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("클래스 등록 실패:", error);
      alert("클래스 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center">
        <div className="text-center">
          <p className="text-stone-600 mb-4">로그인이 필요합니다</p>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold"
          >
            로그인하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-stone-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-stone-100 rounded-full"
            >
              <ArrowLeft className="w-6 h-6 text-stone-500" />
            </button>
            <span className="font-bold text-lg">클래스 등록</span>
            <div className="w-10" />
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-6 space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">기본 정보</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                클래스 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 전통 도자기 만들기 체험"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                클래스 설명 *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="클래스에 대해 자세히 설명해주세요"
                rows={6}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  카테고리 *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  난이도 *
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                >
                  {Object.entries(difficultyLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  가격 (코인) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="10000"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  소요 시간 (분) *
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="120"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>
          </div>

          {/* 위치 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">위치 정보</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                시/도 *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  시/군/구
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="예: 기장군"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  읍/면/동
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="예: 정관읍"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                상세 주소
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="예: 정관로 123"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                위치 안내
              </label>
              <input
                type="text"
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                placeholder="예: 정관 새마을 회관 2층"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>
          </div>

          {/* 추가 정보 */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-800">추가 정보</h3>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                썸네일 이미지 URL
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  최소 연령
                </label>
                <input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  최대 연령
                </label>
                <input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
              </div>
            </div>

            {/* 준비물 */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                준비물
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addMaterial()}
                  placeholder="준비물 추가"
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
                <button
                  onClick={addMaterial}
                  className="px-4 py-3 bg-stone-800 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {materials.map((material, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm"
                  >
                    <span>{material}</span>
                    <button onClick={() => removeMaterial(index)}>
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 포함 사항 */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                포함 사항
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={includeInput}
                  onChange={(e) => setIncludeInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInclude()}
                  placeholder="포함 사항 추가"
                  className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-300"
                />
                <button
                  onClick={addInclude}
                  className="px-4 py-3 bg-stone-800 text-white rounded-xl"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {includes.map((include, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-lg text-sm"
                  >
                    <span>{include}</span>
                    <button onClick={() => removeInclude(index)}>
                      <X className="w-4 h-4 text-stone-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 안내 문구 */}
          <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
            <p className="mb-2">
              * 클래스 등록 후 일정(세션)을 추가하여 수강생을 모집할 수 있습니다.
            </p>
            <p>
              * 등록된 클래스는 관리자 검토 후 공개됩니다.
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "등록 중..." : "클래스 등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
