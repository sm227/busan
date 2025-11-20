import { NextRequest, NextResponse } from 'next/server';
import { UserPreferences } from '@/types';
import { transformApiResponse } from '@/lib/apiTransformer';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const MAFRA_API_KEY = process.env.MAFRA_API_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { userPreferences } = await request.json();
    // console.log('받은 설문 응답:', userPreferences);

    // 1. 전국 지역 코드 (17개 전체)
    const allSidoCodes = [
      '11', '26', '27', '28', '29', '30', '31', '36',  // 특별시/광역시
      '41', '42', '43', '44', '45', '46', '47', '48', '50'  // 도 지역
    ];

    // 2. Gemini AI에게 설문 분석 요청
    const preferencesText = formatPreferencesToText(userPreferences);

    const analysisPrompt = `사용자 선호도에 맞는 한국 지역 코드 7개를 추천하세요.

선호도: ${preferencesText}

지역: 11=서울, 26=부산, 27=대구, 28=인천, 29=광주, 30=대전, 31=울산, 36=세종, 41=경기(수도권), 42=강원(산/자연), 43=충북(내륙), 44=충남(서해), 45=전북(전통), 46=전남(남해/섬), 47=경북(동해/산), 48=경남(남해), 50=제주(섬)

JSON만 출력: {"recommendedRegions": ["42", "43", "44", "45", "46", "47", "48"]}`;

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: analysisPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
        systemInstruction: {
          parts: [{ text: "You are a direct assistant. Do not use thinking mode. Respond immediately with only the requested JSON format." }]
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API 오류:', {
        status: geminiResponse.status,
        statusText: geminiResponse.statusText,
        body: errorText
      });
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    // console.log('Gemini 전체 응답:', JSON.stringify(geminiData, null, 2));

    const candidate = geminiData.candidates?.[0];
    // console.log('Candidate:', JSON.stringify(candidate, null, 2));

    if (!candidate?.content?.parts?.[0]?.text) {
      console.error('Gemini 응답 구조 오류:', {
        hasCandidates: !!geminiData.candidates,
        candidatesLength: geminiData.candidates?.length,
        hasContent: !!candidate?.content,
        hasParts: !!candidate?.content?.parts,
        partsLength: candidate?.content?.parts?.length,
        fullResponse: geminiData
      });
      throw new Error('Gemini 응답 형식 오류');
    }

    let aiResponseText = candidate.content.parts[0].text.trim();
    if (aiResponseText.startsWith('```json')) {
      aiResponseText = aiResponseText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (aiResponseText.startsWith('```')) {
      aiResponseText = aiResponseText.replace(/```\n?/g, '');
    }

    const aiAnalysis = JSON.parse(aiResponseText);
    const recommendedRegions = aiAnalysis.recommendedRegions || allSidoCodes;

    console.log('AI 추천 지역:', recommendedRegions);

    // 3. 모든 추천 지역에서 마을 가져오기
    let allProperties: any[] = [];

    for (const sidoCode of recommendedRegions) {
      console.log(`${sidoCode} 지역에서 마을 검색 중...`);

      const params = new URLSearchParams({
        serviceKey: MAFRA_API_KEY,
        numOfRows: '20',
        pageNo: '1',
        dataType: 'json',
        sidoCode: sidoCode,
      });

      const apiUrl = `https://apis.data.go.kr/B552149/raiseRuralVill/infoVill?${params.toString()}`;

      try {
        const villageResponse = await fetch(apiUrl, {
          headers: { 'Accept': 'application/json' },
        });

        if (villageResponse.ok) {
          const villageData = await villageResponse.json();
          const properties = transformApiResponse(villageData);

          console.log(`   └─ ${properties.length}개 마을 발견`);

          // 모든 마을을 배열에 추가
          allProperties = allProperties.concat(properties);
        }
      } catch (error) {
        console.log(`   └─ ${sidoCode} 지역 API 호출 실패`);
        continue;
      }
    }

    console.log(`총 ${allProperties.length}개`);

    if (allProperties.length === 0) {
      throw new Error('추천 지역에서 마을을 찾을 수 없습니다');
    }

    // 4. 지역별로 그룹핑 (전국 모든 지역)
    const byRegion = allProperties.reduce((acc: any, prop: any) => {
      const region = prop.location.district;
      if (!acc[region]) acc[region] = [];
      acc[region].push(prop);
      return acc;
    }, {});

    const availableRegions = Object.keys(byRegion);
    console.log('지역별 마을 수:', availableRegions.map(r => `${r}: ${byRegion[r].length}`).join(', '));

    // 5. 각 지역에서 최소 2개씩 먼저 선택 (다양성 보장)
    const finalRecommendations: any[] = [];
    const selectedIds = new Set<string>();

    // 5-1. 각 지역에서 2개씩 필수 선택
    availableRegions.forEach(region => {
      if (byRegion[region] && byRegion[region].length > 0) {
        const shuffled = [...byRegion[region]].sort(() => Math.random() - 0.5);
        const toSelect = Math.min(2, byRegion[region].length); // 최대 2개 또는 지역에 있는 만큼

        for (let i = 0; i < toSelect; i++) {
          const selected = shuffled[i];
          finalRecommendations.push(selected);
          selectedIds.add(selected.id);
        }
      }
    });

    // 5-2. 20개가 될 때까지 남은 마을에서 추가 선택
    const needed = 20 - finalRecommendations.length;
    if (needed > 0) {
      const remainingProperties = allProperties.filter(p =>
        !selectedIds.has(p.id)
      );

      const shuffled = [...remainingProperties].sort(() => Math.random() - 0.5);
      const additional = shuffled.slice(0, needed);

      additional.forEach(prop => {
        finalRecommendations.push(prop);
      });
    }

    // 5-3. 최종 셔플 (순서를 무작위로)
    const shuffledFinal = [...finalRecommendations].sort(() => Math.random() - 0.5);

    const regionCounts = shuffledFinal.reduce((acc: any, prop: any) => {
      const region = prop.location.district;
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});


    return NextResponse.json({
      success: true,
      recommendations: shuffledFinal,
      aiRegions: recommendedRegions,
      regionDistribution: regionCounts,
    });

  } catch (error) {
    console.error('AI 추천 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'AI 추천 생성 실패',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

function formatPreferencesToText(prefs: UserPreferences): string {
  const styles = {
    livingStyle: {
      minimalist: '미니멀리스트 (깔끔하고 단순한 생활)',
      cozy: '아늑한 분위기 선호',
      traditional: '전통적인 스타일',
      modern: '현대적인 스타일'
    },
    socialStyle: {
      'community-oriented': '공동체 지향적 (이웃과 교류)',
      'independent': '독립적인 생활',
      'family-focused': '가족 중심',
      'creative': '창의적 활동 선호'
    },
    workStyle: {
      'remote-worker': '원격 근무자',
      'farmer': '농업 종사 희망',
      'entrepreneur': '창업/사업',
      'retiree': '은퇴 후 여유'
    },
    hobbyStyle: {
      'nature-lover': '자연 애호가',
      'culture-enthusiast': '문화/예술 애호가',
      'sports-fan': '스포츠/운동 선호',
      'crafts-person': '공예/만들기 선호'
    },
    pace: {
      slow: '느긋한 생활 리듬',
      balanced: '균형잡힌 생활',
      active: '활동적인 생활'
    },
    budget: {
      low: '저렴한 임대료 (<30만원)',
      medium: '중간 임대료 (30-80만원)',
      high: '높은 예산 (>80만원)'
    }
  };

  return `
- 거주 스타일: ${styles.livingStyle[prefs.livingStyle] || prefs.livingStyle}
- 사회적 성향: ${styles.socialStyle[prefs.socialStyle] || prefs.socialStyle}
- 업무 스타일: ${styles.workStyle[prefs.workStyle] || prefs.workStyle}
- 취미 활동: ${styles.hobbyStyle[prefs.hobbyStyle] || prefs.hobbyStyle}
- 생활 페이스: ${styles.pace[prefs.pace] || prefs.pace}
- 예산: ${styles.budget[prefs.budget] || prefs.budget}
  `.trim();
}
