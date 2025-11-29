/**
 * S3 Configuration
 * Central location for S3 bucket URLs and constants
 */

// S3 Bucket configuration
export const S3_CONFIG = {
  BUCKET_REGION: 'ap-northeast-2',
  BUCKET_NAME: 'binjib-dabang',
  BASE_URL: 'https://binjib-dabang.s3.ap-northeast-2.amazonaws.com',
} as const;

// Image constants
export const HOUSE_IMAGES = {
  TOTAL_COUNT: 49,
  FOLDER: 'house',
  EXTENSION: '.jpeg',

  /**
   * Generate S3 URL for a house image
   * @param number - House image number (1-49)
   * @returns Full S3 URL
   */
  getUrl: (number: number): string => {
    if (number < 1 || number > 49) {
      throw new Error(`Invalid house image number: ${number}. Must be between 1 and 49.`);
    }
    return `${S3_CONFIG.BASE_URL}/${HOUSE_IMAGES.FOLDER}/house${number}${HOUSE_IMAGES.EXTENSION}`;
  },
} as const;
