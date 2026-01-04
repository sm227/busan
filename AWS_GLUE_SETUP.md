# AWS Glue 통합 설정 가이드

## 개요

이 프로젝트는 AWS Glue를 사용하여 설문조사 데이터를 분석합니다.

**데이터 파이프라인:**
```
PostgreSQL → S3 (Export) → AWS Glue (분석) → S3 (결과) → Next.js (표시)
```

## 사전 준비사항

- ✅ AWS 계정
- ✅ S3 버킷: `binjib-dabang` (이미 생성됨)
- ✅ AWS 자격증명 (ACCESS_KEY, SECRET_KEY)

## 1단계: S3 폴더 생성

AWS Console 또는 CLI로 다음 폴더들을 생성하세요:

```bash
# AWS CLI 사용
aws s3api put-object --bucket binjib-dabang --key glue-input/surveys/
aws s3api put-object --bucket binjib-dabang --key glue-output/analytics/
aws s3api put-object --bucket binjib-dabang --key glue-scripts/
```

또는 AWS Console에서:
1. S3 → `binjib-dabang` 버킷 선택
2. 폴더 생성: `glue-input/surveys/`
3. 폴더 생성: `glue-output/analytics/`
4. 폴더 생성: `glue-scripts/`

## 2단계: Glue Python 스크립트 업로드

로컬 파일을 S3에 업로드:

```bash
aws s3 cp glue-jobs/survey-analytics-job.py s3://binjib-dabang/glue-scripts/survey-analytics-job.py
```

또는 AWS Console에서:
1. S3 → `binjib-dabang` → `glue-scripts/` 폴더
2. Upload → `glue-jobs/survey-analytics-job.py` 파일 선택

## 3단계: IAM 역할 생성

### 3-1. IAM Console에서 역할 생성

1. IAM Console → Roles → Create role
2. **Trusted entity type**: AWS service
3. **Use case**: Glue 선택
4. **Permissions**: 다음 정책 추가
   - `AWSGlueServiceRole` (AWS 관리형 정책)
   - 커스텀 정책 생성 (아래 참조)

### 3-2. S3 접근 커스텀 정책

정책 이름: `GlueS3AccessPolicy`

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:s3:::binjib-dabang/glue-input/*",
        "arn:aws:s3:::binjib-dabang/glue-output/*",
        "arn:aws:s3:::binjib-dabang/glue-scripts/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::binjib-dabang"
    }
  ]
}
```

### 3-3. 역할 이름

- **Role name**: `GlueServiceRole-SurveyAnalytics`
- 역할 ARN 복사 (나중에 사용)

## 4단계: AWS Glue Job 생성

### 4-1. Glue Console에서 Job 생성

1. AWS Glue Console → ETL Jobs → Create job
2. **Job details**:
   - Name: `survey-analytics-job`
   - IAM Role: `GlueServiceRole-SurveyAnalytics` 선택
   - Type: **Python Shell script** (Spark 아님!)
   - Python version: **Python 3.9**
   - Maximum capacity: **0.0625 DPU** (가장 저렴)

3. **Script**:
   - Script path: `s3://binjib-dabang/glue-scripts/survey-analytics-job.py`

4. **Advanced properties**:
   - Timeout: **10 minutes**
   - Job parameters:
     ```
     --input_key: (런타임에 전달됨)
     --output_bucket: (런타임에 전달됨)
     ```

5. **Save** 클릭

### 4-2. (선택) CLI로 Job 생성

```bash
aws glue create-job \
  --name survey-analytics-job \
  --role GlueServiceRole-SurveyAnalytics \
  --command "Name=pythonshell,ScriptLocation=s3://binjib-dabang/glue-scripts/survey-analytics-job.py,PythonVersion=3.9" \
  --max-capacity 0.0625 \
  --timeout 10
```

## 5단계: 환경변수 설정

`.env` 파일에 추가:

```env
# AWS Glue Configuration
AWS_GLUE_JOB_NAME=survey-analytics-job
```

기존 AWS 자격증명이 이미 있으므로 추가 설정 불필요합니다.

## 6단계: 테스트 실행

### 6-1. 수동으로 데이터 Export 테스트

```bash
node scripts/export-surveys-to-s3.js
```

출력 예시:
```
📊 Fetching survey results from PostgreSQL...
✅ Found 25 survey results
📝 Converting to CSV format...
☁️  Uploading to S3: glue-input/surveys/surveys_2026-01-04T10-30-00.csv...
✅ Successfully uploaded to s3://binjib-dabang/glue-input/surveys/surveys_2026-01-04T10-30-00.csv
```

### 6-2. Glue Job 수동 실행 (AWS Console)

1. Glue Console → Jobs → `survey-analytics-job` 선택
2. **Run job** 클릭
3. Job parameters 입력:
   - `--input_key`: `glue-input/surveys/surveys_2026-01-04T10-30-00.csv` (위에서 생성된 파일)
   - `--output_bucket`: `binjib-dabang`
4. **Run job** 클릭

### 6-3. Job 실행 상태 확인

1. Glue Console → Jobs → `survey-analytics-job` → Runs 탭
2. Status 확인:
   - STARTING → RUNNING → SUCCEEDED (성공)
   - 실패 시 CloudWatch Logs 확인

### 6-4. 결과 확인

S3에서 결과 파일 확인:
```
s3://binjib-dabang/glue-output/analytics/
├── survey_analytics_2026-01-04_103000.json
└── latest.json
```

## 7단계: API를 통한 파이프라인 실행

### 7-1. API 테스트 (curl)

```bash
curl -X POST http://localhost:3000/api/admin/trigger-analytics
```

응답 예시:
```json
{
  "success": true,
  "message": "분석 파이프라인이 시작되었습니다",
  "data": {
    "export": {
      "recordCount": 25,
      "s3Key": "glue-input/surveys/surveys_2026-01-04T10-30-00.csv"
    },
    "glue": {
      "jobName": "survey-analytics-job",
      "jobRunId": "jr_abc123..."
    }
  }
}
```

### 7-2. 분석 결과 조회

```bash
curl http://localhost:3000/api/analytics/survey
```

응답 예시:
```json
{
  "success": true,
  "data": {
    "generated_at": "2026-01-04T10:30:00Z",
    "total_surveys": 25,
    "preference_distribution": {
      "living_style": {
        "cozy": 10,
        "minimalist": 8,
        "traditional": 5,
        "modern": 2
      },
      ...
    },
    "insights": [
      "가장 인기 있는 생활 스타일: cozy (10명)",
      "가장 많은 직업 스타일: remote-worker (12명)"
    ]
  }
}
```

## 8단계: 프론트엔드 통합 (선택사항)

관리자 페이지에서 분석 결과 표시:

```typescript
// 예시 코드
async function triggerAnalytics() {
  const response = await fetch('/api/admin/trigger-analytics', {
    method: 'POST'
  });
  const result = await response.json();
  console.log('Pipeline started:', result);
}

async function fetchAnalytics() {
  const response = await fetch('/api/analytics/survey');
  const result = await response.json();
  console.log('Analytics:', result.data);
}
```

## 비용 예상

### 예상 비용 (서울 리전 기준)

- **Glue Python Shell**: $0.44/시간 × DPU
  - 0.0625 DPU × 2분 실행 = ~$0.001 per run
- **S3 저장**: 1MB × $0.023/GB = 무시 가능
- **S3 요청**: PUT/GET 요청 × $0.0004 = 무시 가능

**월 30회 실행 시: 약 $0.03**

**대회 데모 시: < $0.01**

## 트러블슈팅

### 1. Glue Job이 FAILED 상태

**해결:**
- CloudWatch Logs 확인: Glue Console → Jobs → Runs → View logs
- 일반적 원인:
  - S3 권한 부족 → IAM 역할 확인
  - 스크립트 오류 → Python 문법 확인
  - 데이터 형식 오류 → CSV 헤더 확인

### 2. Export 스크립트 실패

**해결:**
```bash
# 환경변수 확인
echo $DATABASE_URL
echo $AWS_S3_BUCKET_NAME

# Prisma 확인
npx prisma db pull
```

### 3. API 호출 시 권한 오류

**해결:**
- AWS 자격증명 확인 (.env 파일)
- IAM 사용자에 Glue 권한 추가:
  ```json
  {
    "Effect": "Allow",
    "Action": [
      "glue:StartJobRun",
      "glue:GetJobRun"
    ],
    "Resource": "*"
  }
  ```

### 4. 분석 결과가 없음 (404)

**원인:** Glue Job이 아직 완료되지 않았거나 실패

**해결:**
1. Glue Console에서 Job 상태 확인
2. Job이 SUCCEEDED인지 확인
3. S3에 `latest.json` 파일이 있는지 확인

## 다음 단계

1. ✅ 설문 데이터 수집 (사용자가 questionnaire 완료)
2. ✅ Export 스크립트 실행
3. ✅ Glue Job 실행
4. ✅ 분석 결과 확인
5. 🎯 **대회 시연 준비!**

## 대회 시연 체크리스트

- [ ] PostgreSQL에 설문 데이터 10개 이상 존재
- [ ] S3 폴더 구조 생성 완료
- [ ] IAM 역할 생성 및 권한 설정 완료
- [ ] Glue Job 생성 완료
- [ ] Export 스크립트 테스트 성공
- [ ] Glue Job 수동 실행 테스트 성공
- [ ] API 엔드포인트 테스트 성공
- [ ] 분석 결과 조회 성공
- [ ] 데모 시나리오 준비 완료

## 참고 자료

- [AWS Glue 공식 문서](https://docs.aws.amazon.com/glue/)
- [Python Shell Jobs](https://docs.aws.amazon.com/glue/latest/dg/add-job-python.html)
- [Glue IAM 권한](https://docs.aws.amazon.com/glue/latest/dg/create-service-policy.html)
