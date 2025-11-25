const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile('2025년 지역축제 개최계획 현황(0321).xlsx');

const worksheet = workbook.Sheets['조사표'];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

const festivals = [];

for (let i = 6; i < rawData.length; i++) {
  const row = rawData[i];

  if (!row || row.length < 10) continue;

  const province = row[1];      // 광역자치단체명
  const city = row[2];          // 기초자치단체명
  const name = row[3];          // 축제명
  const venueName = row[5];     // 장소명
  const startYear = row[10];    // 시작 년
  const startMonth = row[11];   // 시작 월
  const startDay = row[12];     // 시작 일
  const endYear = row[13];      // 종료 년
  const endMonth = row[14];     // 종료 월
  const endDay = row[15];       // 종료 일
  const duration = row[16];     // 총 일수
  const organization = row[31]; // 기관명
  const department = row[32];   // 부서명
  const contact = row[33];      // 연락처

  // 유효한 데이터인지 확인
  if (!name || typeof name !== 'string' || !province || !city) continue;
  if (name.includes('축제명') || name.includes('합계')) continue;

  let period = '';
  if (startYear && startMonth) {
    const startDate = `${startYear}.${String(startMonth).padStart(2, '0')}${startDay ? '.' + String(startDay).padStart(2, '0') : ''}`;
    const endDate = `${endYear || startYear}.${String(endMonth).padStart(2, '0')}${endDay ? '.' + String(endDay).padStart(2, '0') : ''}`;

    if (duration && duration !== '미정') {
      period = `${startDate} ~ ${endDate} (${duration}일)`;
    } else {
      period = `${startDate} ~ ${endDate}`;
    }
  } else {
    period = '미정';
  }

  festivals.push({
    id: festivals.length + 1,
    name: name.trim(),
    province: province.trim(),
    city: city.trim(),
    location: `${province} ${city}`,
    period: period,
    startYear: startYear || null,
    startMonth: startMonth || null,
    startDay: startDay || null,
    endYear: endYear || null,
    endMonth: endMonth || null,
    endDay: endDay || null,
    duration: duration || null,
    venueName: venueName ? venueName.toString().trim() : null,
    organization: organization ? organization.toString().trim() : null,
    department: department ? department.toString().trim() : null,
    contact: contact ? contact.toString().trim() : null
  });
}

festivals.slice(0, 5).forEach(f => {
  console.log(`- ${f.name} | ${f.location} | ${f.period}`);
});

const outputPath = path.join(__dirname, '..', 'src', 'data', 'festivals.json');
fs.writeFileSync(outputPath, JSON.stringify(festivals, null, 2), 'utf-8');
