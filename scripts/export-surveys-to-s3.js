import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Convert survey results to CSV format
 */
function convertToCSV(surveys) {
  // CSV Headers
  const headers = [
    'id',
    'user_id',
    'occupation',
    'living_style',
    'social_style',
    'work_style',
    'hobby_style',
    'pace',
    'budget',
    'purchase_type',
    'created_at'
  ];

  // CSV Rows
  const rows = surveys.map(survey => [
    survey.id,
    survey.userId,
    survey.occupation || '',
    survey.livingStyle,
    survey.socialStyle,
    survey.workStyle,
    survey.hobbyStyle,
    survey.pace,
    survey.budget,
    survey.purchaseType,
    survey.createdAt.toISOString()
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Export survey results from PostgreSQL to S3
 */
async function exportSurveysToS3() {
  try {
    console.log('📊 Fetching survey results from PostgreSQL...');

    // Query all survey results
    const surveys = await prisma.surveyResult.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`✅ Found ${surveys.length} survey results`);

    if (surveys.length === 0) {
      console.log('⚠️  No survey data to export');
      return null;
    }

    // Convert to CSV
    console.log('📝 Converting to CSV format...');
    const csv = convertToCSV(surveys);

    // Generate timestamp filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const key = `glue-input/surveys/surveys_${timestamp}.csv`;

    console.log(`☁️  Uploading to S3: ${key}...`);

    // Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME || 'binjib-dabang',
      Key: key,
      Body: csv,
      ContentType: 'text/csv',
    }));

    const s3Url = `s3://${process.env.AWS_S3_BUCKET_NAME || 'binjib-dabang'}/${key}`;
    console.log(`✅ Successfully uploaded to ${s3Url}`);
    console.log(`📦 File size: ${csv.length} bytes`);

    return {
      key,
      url: s3Url,
      recordCount: surveys.length,
      size: csv.length
    };
  } catch (error) {
    console.error('❌ Error exporting surveys to S3:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the export
exportSurveysToS3()
  .then((result) => {
    if (result) {
      console.log('\n🎉 Export completed successfully!');
      console.log(JSON.stringify(result, null, 2));
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Export failed:', error.message);
    process.exit(1);
  });
