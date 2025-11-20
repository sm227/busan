import { NextRequest, NextResponse } from 'next/server';
import { transformApiResponse } from '@/lib/apiTransformer';
import { prisma } from '@/lib/prisma';

const MAFRA_API_KEY = process.env.MAFRA_API_KEY!;

export async function GET(request: NextRequest) {
  try {
    // console.log('🏘️ === 마을 데이터 조회 시작 ===');

    // 1. 먼저 DB에서 데이터 확인
    const villageCount = await prisma.village.count();
    // console.log(`DB에 저장된 마을: ${villageCount}개`);

    // DB에 데이터가 있으면 DB에서 반환
    if (villageCount > 0) {
      // console.log('DB에서 마을 데이터 반환');
      const villages = await prisma.village.findMany({
        orderBy: {
          district: 'asc',
        },
      });

      // Prisma 데이터를 앱 형식으로 변환
      const properties = villages.map((v) => ({
        id: v.id,
        title: v.title,
        location: {
          district: v.district,
          city: v.city,
          region: v.region || '',
        },
        price: {
          rent: v.rent || 0,
          sale: v.sale || undefined,
          deposit: v.deposit || undefined,
        },
        details: {
          rooms: v.rooms,
          size: v.size,
          type: v.type,
          yearBuilt: v.yearBuilt || undefined,
          condition: v.condition,
        },
        images: v.images as string[],
        features: v.features as string[],
        surroundings: v.surroundings as any,
        communityInfo: v.communityInfo as any,
      }));

      return NextResponse.json({
        success: true,
        properties,
        source: 'database',
        count: properties.length,
      });
    }

    // DB에 빈집이 있는 마을이 없으면 API 돌리기

    const sidoCodes = [
      { code: '11', name: '서울특별시' },
      { code: '26', name: '부산광역시' },
      { code: '27', name: '대구광역시' },
      { code: '28', name: '인천광역시' },
      { code: '29', name: '광주광역시' },
      { code: '30', name: '대전광역시' },
      { code: '31', name: '울산광역시' },
      { code: '36', name: '세종특별자치시' },
      { code: '41', name: '경기도' },
      { code: '42', name: '강원특별자치도' },
      { code: '43', name: '충청북도' },
      { code: '44', name: '충청남도' },
      { code: '45', name: '전북특별자치도' },
      { code: '46', name: '전라남도' },
      { code: '47', name: '경상북도' },
      { code: '48', name: '경상남도' },
      { code: '50', name: '제주특별자치도' },
    ];

    let allProperties: any[] = [];

    for (const sido of sidoCodes) {

      try {
        const params = new URLSearchParams({
          serviceKey: MAFRA_API_KEY,
          pageNo: '1',
          numOfRows: '100',
          dataType: 'json',
          sidoCode: sido.code,
        });

        const apiUrl = `https://apis.data.go.kr/B552149/raiseRuralVill/infoVill?${params.toString()}`;

        const response = await fetch(apiUrl, {
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          const properties = transformApiResponse(data);

          allProperties = [...allProperties, ...properties];
        }
      } catch (error) {
        console.error(`${sido.name} API 호출 실패:`, error);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // DB에 저장
    let savedCount = 0;
    for (const property of allProperties) {
      try {
        await prisma.village.upsert({
          where: { id: String(property.id) },
          update: {
            title: property.title,
            district: property.location.district,
            city: property.location.city,
            region: property.location.region || null,
            rent: property.price.rent || null,
            sale: property.price.sale || null,
            deposit: property.price.deposit || null,
            rooms: property.details.rooms,
            size: property.details.size,
            type: property.details.type,
            yearBuilt: property.details.yearBuilt || null,
            condition: property.details.condition,
            images: property.images,
            features: property.features,
            surroundings: property.surroundings,
            communityInfo: property.communityInfo,
          },
          create: {
            id: String(property.id),
            title: property.title,
            district: property.location.district,
            city: property.location.city,
            region: property.location.region || null,
            rent: property.price.rent || null,
            sale: property.price.sale || null,
            deposit: property.price.deposit || null,
            rooms: property.details.rooms,
            size: property.details.size,
            type: property.details.type,
            yearBuilt: property.details.yearBuilt || null,
            condition: property.details.condition,
            images: property.images,
            features: property.features,
            surroundings: property.surroundings,
            communityInfo: property.communityInfo,
          },
        });
        savedCount++;
      } catch (error) {
        // console.error(`   ⚠️ ${property.title} 저장 실패:`, error);
      }
    }


    return NextResponse.json({
      success: true,
      properties: allProperties,
      source: 'api',
      count: allProperties.length,
      saved: savedCount,
    });

  } catch (error) {
    // console.error(' 마을 데이터 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: '마을 데이터 조회 실패',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}