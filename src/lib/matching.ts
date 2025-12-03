import { UserPreferences, RuralProperty } from '@/types';

export class MatchingAlgorithm {
  
  static calculateMatchScore(preferences: UserPreferences, property: RuralProperty): number {
    let score = 0;
    let totalWeight = 0;

    // 1. 거주 스타일 매칭 (가중치: 25%)
    const livingStyleWeight = 25;
    const livingStyleScore = this.matchLivingStyle(preferences.livingStyle, property);
    score += livingStyleScore * livingStyleWeight;
    totalWeight += livingStyleWeight;

    // 2. 사회적 스타일 매칭 (가중치: 20%)
    const socialStyleWeight = 20;
    const socialStyleScore = this.matchSocialStyle(preferences.socialStyle, property);
    score += socialStyleScore * socialStyleWeight;
    totalWeight += socialStyleWeight;

    // 3. 업무 스타일 매칭 (가중치: 15%)
    const workStyleWeight = 15;
    const workStyleScore = this.matchWorkStyle(preferences.workStyle, property);
    score += workStyleScore * workStyleWeight;
    totalWeight += workStyleWeight;

    // 4. 취미 스타일 매칭 (가중치: 15%)
    const hobbyStyleWeight = 15;
    const hobbyStyleScore = this.matchHobbyStyle(preferences.hobbyStyle, property);
    score += hobbyStyleScore * hobbyStyleWeight;
    totalWeight += hobbyStyleWeight;

    // 5. 생활 페이스 매칭 (가중치: 10%)
    const paceWeight = 10;
    const paceScore = this.matchPace(preferences.pace, property);
    score += paceScore * paceWeight;
    totalWeight += paceWeight;

    // 6. 예산 매칭 (가중치: 15%)
    const budgetWeight = 15;
    const budgetScore = this.matchBudget(preferences.budget, property, preferences.purchaseType);
    score += budgetScore * budgetWeight;
    totalWeight += budgetWeight;

    return Math.round((score / totalWeight) * 100);
  }

  private static matchLivingStyle(style: string, property: RuralProperty): number {
    const styleScores: { [key: string]: { [key: string]: number } } = {
      minimalist: {
        modern: 0.9,
        hanok: 0.7,
        apartment: 0.8,
        farm: 0.6
      },
      cozy: {
        hanok: 0.9,
        farm: 0.8,
        modern: 0.7,
        apartment: 0.6
      },
      traditional: {
        hanok: 1.0,
        farm: 0.8,
        modern: 0.4,
        apartment: 0.3
      },
      modern: {
        modern: 1.0,
        apartment: 0.9,
        hanok: 0.5,
        farm: 0.4
      }
    };

    return styleScores[style]?.[property.details.type] || 0.5;
  }

  private static matchSocialStyle(style: string, property: RuralProperty): number {
    const population = property.communityInfo.population;
    
    const styleScores: { [key: string]: (pop: number) => number } = {
      'community-oriented': (pop) => pop < 100 ? 1.0 : pop < 500 ? 0.8 : 0.6,
      'independent': (pop) => pop < 50 ? 1.0 : pop < 200 ? 0.7 : 0.4,
      'family-focused': (pop) => pop < 200 ? 0.9 : pop < 1000 ? 0.8 : 0.6,
      'creative': (pop) => pop > 200 ? 0.8 : pop > 100 ? 0.6 : 0.4
    };

    return styleScores[style]?.(population) || 0.5;
  }

  private static matchWorkStyle(style: string, property: RuralProperty): number {
    const transportationScore = property.surroundings.transportation.length > 1 ? 0.8 : 0.5;
    const industriesMatch = property.communityInfo.mainIndustries || [];

    // mainIndustries가 배열인지 확인
    const industries = Array.isArray(industriesMatch) ? industriesMatch : [];

    const styleScores: { [key: string]: number } = {
      'remote-worker': transportationScore * 0.7 + (industries.includes('관광업') ? 0.3 : 0.2),
      'farmer': industries.includes('농업') ? 1.0 : 0.3,
      'entrepreneur': industries.includes('관광업') ? 0.9 : 0.6,
      'retiree': 0.8
    };

    return styleScores[style] || 0.5;
  }

  private static matchHobbyStyle(style: string, property: RuralProperty): number {
    const naturalFeatures = property.surroundings.naturalFeatures;
    const culturalActivities = property.communityInfo.culturalActivities;

    const styleScores: { [key: string]: number } = {
      'nature-lover': naturalFeatures.length >= 2 ? 1.0 : naturalFeatures.length >= 1 ? 0.7 : 0.4,
      'culture-enthusiast': culturalActivities.some(activity => 
        activity.includes('전통') || activity.includes('축제') || activity.includes('문화')
      ) ? 1.0 : 0.5,
      'sports-fan': culturalActivities.some(activity => 
        activity.includes('등산') || activity.includes('운동') || activity.includes('자전거')
      ) ? 0.9 : 0.6,
      'crafts-person': culturalActivities.some(activity => 
        activity.includes('공예') || activity.includes('만들기') || activity.includes('체험')
      ) ? 1.0 : 0.5
    };

    return styleScores[style] || 0.5;
  }

  private static matchPace(pace: string, property: RuralProperty): number {
    const population = property.communityInfo.population;
    const averageAge = property.communityInfo.averageAge;

    const paceScores: { [key: string]: number } = {
      slow: population < 100 && averageAge > 60 ? 1.0 : 0.7,
      balanced: population < 500 ? 0.9 : 0.6,
      active: population > 200 && averageAge < 50 ? 0.9 : 0.5
    };

    return paceScores[pace] || 0.5;
  }

  private static matchBudget(budget: string, property: RuralProperty, purchaseType?: 'sale' | 'rent'): number {
    // 예산 매칭은 항상 1.0 반환 (필터링에서 이미 범위 체크함)
    return 1.0;
  }

  static getRecommendations(
    preferences: UserPreferences,
    properties: RuralProperty[],
    limit: number = 10
  ): RuralProperty[] {
    // 예산 범위 정의 (만원 단위로 변경)
    const budgetRanges: { [key: string]: { min: number; max: number } } = preferences.purchaseType === 'sale'
      ? {
          low: { min: 1000, max: 3000 },      // 1천만원 ~ 3천만원 (만원 단위)
          medium: { min: 3000, max: 6000 },   // 3천만원 ~ 6천만원 (만원 단위)
          high: { min: 6000, max: 15000 }     // 6천만원 ~ 1억 5천만원 (만원 단위)
        }
      : {
          low: { min: 1, max: 5 },         // 월 1만원 ~ 5만원 (만원 단위)
          medium: { min: 5, max: 10 },     // 월 5만원 ~ 10만원 (만원 단위)
          high: { min: 10, max: 20 }       // 월 10만원 ~ 20만원 (만원 단위)
        };

    const range = budgetRanges[preferences.budget];

    // 랜덤 가격 생성 함수
    const generateRandomPrice = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return properties
      .map(property => {
        // 선택한 예산 범위 내에서 랜덤 가격 생성
        const randomPrice = generateRandomPrice(range.min, range.max);

        // purchaseType에 따라 가격 할당
        // 매매, 월세 모두 만원 단위로 저장
        const updatedProperty = {
          ...property,
          price: preferences.purchaseType === 'sale'
            ? { ...property.price, sale: randomPrice * 10000 }  // 만원 -> 원으로 변환
            : { ...property.price, rent: randomPrice * 10000 }  // 만원 -> 원으로 변환
        };

        return {
          ...updatedProperty,
          matchScore: this.calculateMatchScore(preferences, updatedProperty)
        };
      })
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
      .slice(0, limit);
  }
}