import { NextRequest, NextResponse } from 'next/server';
import { transformApiResponse } from '@/lib/apiTransformer';

const SERVICE_KEY = process.env.MAFRA_API_KEY!;
const API_BASE_URL = 'https://apis.data.go.kr/B552149/raiseRuralVill/infoVill';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const pageNo = searchParams.get('pageNo') || '1';
  const numOfRows = searchParams.get('numOfRows') || '100';
  const sidoCode = searchParams.get('sidoCode') || '';
  const sggCode = searchParams.get('sggCode') || '';

  try {
    const params = new URLSearchParams({
      serviceKey: SERVICE_KEY,
      pageNo,
      numOfRows,
      dataType: 'json',
    });

    if (sidoCode) params.append('sidoCode', sidoCode);
    if (sggCode) params.append('sggCode', sggCode);

    const apiUrl = `${API_BASE_URL}?${params.toString()}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // 실시간 데이터 가져오기
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    // Transform the API response to match our app format
    const properties = transformApiResponse(data);

    return NextResponse.json(
      {
        success: true,
        properties,
        raw: data, // 원본 데이터도 포함 (디버깅용)
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch (error) {
    console.error('Rural village API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rural village data' },
      { status: 500 }
    );
  }
}
