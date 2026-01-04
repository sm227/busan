"""
AWS Glue Job: Survey Analytics
분석 대상: 설문조사 응답 데이터 (survey_results)
출력: 사용자 선호도 분석 결과 (JSON)
"""

import sys
import json
import boto3
from datetime import datetime
from collections import Counter

# AWS Glue는 pandas를 기본 제공
import pandas as pd


def get_job_parameters():
    """Get job parameters from AWS Glue job arguments"""
    # For testing locally, use default values
    try:
        from awsglue.utils import getResolvedOptions
        args = getResolvedOptions(sys.argv, ['input_key', 'output_bucket'])
        return args['input_key'], args['output_bucket']
    except:
        # Default values for local testing
        return (
            'glue-input/surveys/surveys_latest.csv',
            'binjib-dabang'
        )


def read_csv_from_s3(bucket, key):
    """Read CSV file from S3 and return pandas DataFrame"""
    s3 = boto3.client('s3')
    obj = s3.get_object(Bucket=bucket, Key=key)
    df = pd.read_csv(obj['Body'])
    print(f"✅ Loaded {len(df)} records from s3://{bucket}/{key}")
    return df


def analyze_preference_distribution(df):
    """Analyze distribution of each preference category"""
    categories = [
        'living_style',
        'social_style',
        'work_style',
        'hobby_style',
        'pace',
        'budget',
        'purchase_type'
    ]

    distribution = {}
    for category in categories:
        if category in df.columns:
            counts = df[category].value_counts().to_dict()
            distribution[category] = counts

    return distribution


def analyze_trends(df):
    """Analyze temporal trends in survey submissions"""
    if 'created_at' not in df.columns:
        return {}

    # Convert to datetime
    df['created_at'] = pd.to_datetime(df['created_at'])

    # Daily submission counts
    daily_counts = df.groupby(df['created_at'].dt.date).size().to_dict()
    daily_counts = {str(k): int(v) for k, v in daily_counts.items()}

    # Week over week growth (if applicable)
    total_surveys = len(df)

    return {
        'daily_submissions': daily_counts,
        'total_surveys': total_surveys
    }


def analyze_occupation_distribution(df):
    """Analyze occupation categories"""
    if 'occupation' not in df.columns:
        return {}

    # Filter out empty occupations
    occupations = df[df['occupation'].notna()]['occupation']

    if len(occupations) == 0:
        return {}

    # Count occupations
    occupation_counts = Counter(occupations).most_common(10)

    return {
        'top_occupations': [
            {'occupation': occ, 'count': count}
            for occ, count in occupation_counts
        ],
        'total_with_occupation': len(occupations)
    }


def analyze_correlations(df):
    """Analyze correlations between different preferences"""
    correlations = {}

    # Living style vs Work style
    if 'living_style' in df.columns and 'work_style' in df.columns:
        crosstab = pd.crosstab(df['living_style'], df['work_style'])
        correlations['living_work'] = crosstab.to_dict()

    # Hobby style vs Social style
    if 'hobby_style' in df.columns and 'social_style' in df.columns:
        crosstab = pd.crosstab(df['hobby_style'], df['social_style'])
        correlations['hobby_social'] = crosstab.to_dict()

    # Budget vs Purchase type
    if 'budget' in df.columns and 'purchase_type' in df.columns:
        crosstab = pd.crosstab(df['budget'], df['purchase_type'])
        correlations['budget_purchase'] = crosstab.to_dict()

    return correlations


def generate_insights(distribution, trends, occupation_dist, correlations):
    """Generate human-readable insights from analytics"""
    insights = []

    # Most popular living style
    if 'living_style' in distribution:
        most_popular = max(distribution['living_style'].items(), key=lambda x: x[1])
        insights.append(f"가장 인기 있는 생활 스타일: {most_popular[0]} ({most_popular[1]}명)")

    # Most popular work style
    if 'work_style' in distribution:
        most_popular = max(distribution['work_style'].items(), key=lambda x: x[1])
        insights.append(f"가장 많은 직업 스타일: {most_popular[0]} ({most_popular[1]}명)")

    # Most popular hobby
    if 'hobby_style' in distribution:
        most_popular = max(distribution['hobby_style'].items(), key=lambda x: x[1])
        insights.append(f"가장 선호하는 취미 스타일: {most_popular[0]} ({most_popular[1]}명)")

    # Purchase type preference
    if 'purchase_type' in distribution:
        sale_count = distribution['purchase_type'].get('sale', 0)
        rent_count = distribution['purchase_type'].get('rent', 0)
        if sale_count > rent_count:
            insights.append(f"매매 선호 ({sale_count}명) > 임대 선호 ({rent_count}명)")
        else:
            insights.append(f"임대 선호 ({rent_count}명) > 매매 선호 ({sale_count}명)")

    return insights


def save_analytics_to_s3(analytics, bucket, output_folder='glue-output/analytics'):
    """Save analytics results to S3 as JSON"""
    s3 = boto3.client('s3')

    # Generate timestamped filename
    timestamp = datetime.utcnow().strftime('%Y-%m-%d_%H%M%S')

    # Convert to JSON
    analytics_json = json.dumps(analytics, ensure_ascii=False, indent=2)

    # Save timestamped version
    timestamped_key = f"{output_folder}/survey_analytics_{timestamp}.json"
    s3.put_object(
        Bucket=bucket,
        Key=timestamped_key,
        Body=analytics_json,
        ContentType='application/json'
    )
    print(f"✅ Saved analytics to s3://{bucket}/{timestamped_key}")

    # Also save as "latest.json"
    latest_key = f"{output_folder}/latest.json"
    s3.put_object(
        Bucket=bucket,
        Key=latest_key,
        Body=analytics_json,
        ContentType='application/json'
    )
    print(f"✅ Updated latest analytics at s3://{bucket}/{latest_key}")

    return timestamped_key, latest_key


def main():
    """Main ETL job execution"""
    print("🚀 Starting Survey Analytics Glue Job...")

    # Get parameters
    input_key, output_bucket = get_job_parameters()

    # Extract bucket from input key (assumes s3://bucket/key format or just key)
    input_bucket = output_bucket  # Same bucket for simplicity

    # Read data from S3
    print(f"📥 Reading data from S3...")
    df = read_csv_from_s3(input_bucket, input_key)

    # Perform analytics
    print("📊 Analyzing preference distribution...")
    preference_distribution = analyze_preference_distribution(df)

    print("📈 Analyzing trends...")
    trends = analyze_trends(df)

    print("💼 Analyzing occupation distribution...")
    occupation_dist = analyze_occupation_distribution(df)

    print("🔗 Analyzing correlations...")
    correlations = analyze_correlations(df)

    # Generate insights
    print("💡 Generating insights...")
    insights = generate_insights(
        preference_distribution,
        trends,
        occupation_dist,
        correlations
    )

    # Compile analytics results
    analytics = {
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'total_surveys': len(df),
        'preference_distribution': preference_distribution,
        'trends': trends,
        'occupation_distribution': occupation_dist,
        'correlations': correlations,
        'insights': insights
    }

    # Save to S3
    print("💾 Saving analytics results to S3...")
    timestamped_key, latest_key = save_analytics_to_s3(analytics, output_bucket)

    print(f"\n✨ Analytics job completed successfully!")
    print(f"📊 Processed {len(df)} survey responses")
    print(f"💡 Generated {len(insights)} insights")

    return analytics


if __name__ == '__main__':
    try:
        result = main()
        print("\n🎉 Job finished successfully!")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Job failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
