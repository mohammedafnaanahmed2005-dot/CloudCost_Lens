/**
 * Synthetic demonstration dataset for CloudCost Lens.
 * Spans 21 continuous days across 6 realistic cloud services.
 * Features a controlled, detectable spending anomaly on 'Amazon EC2' starting around day 17,
 * jumping from baseline ~$48/day to over $340/day.
 */
export const SAMPLE_BILLING_CSV = `date,service,cost,currency,project,resourceId,region
2026-10-01,Amazon EC2,48.50,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-01,Amazon S3,12.20,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-01,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-01,AWS Lambda,4.15,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-01,Amazon CloudFront,6.80,USD,frontend-edge,cf-dist-app-prod,global
2026-10-01,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-02,Amazon EC2,49.10,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-02,Amazon S3,12.45,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-02,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-02,AWS Lambda,4.30,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-02,Amazon CloudFront,7.10,USD,frontend-edge,cf-dist-app-prod,global
2026-10-02,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-03,Amazon EC2,47.80,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-03,Amazon S3,12.80,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-03,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-03,AWS Lambda,3.95,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-03,Amazon CloudFront,6.40,USD,frontend-edge,cf-dist-app-prod,global
2026-10-03,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-04,Amazon EC2,50.20,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-04,Amazon S3,13.10,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-04,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-04,AWS Lambda,4.50,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-04,Amazon CloudFront,7.50,USD,frontend-edge,cf-dist-app-prod,global
2026-10-04,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-05,Amazon EC2,48.90,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-05,Amazon S3,13.40,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-05,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-05,AWS Lambda,4.20,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-05,Amazon CloudFront,6.90,USD,frontend-edge,cf-dist-app-prod,global
2026-10-05,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-06,Amazon EC2,51.00,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-06,Amazon S3,13.80,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-06,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-06,AWS Lambda,4.80,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-06,Amazon CloudFront,8.20,USD,frontend-edge,cf-dist-app-prod,global
2026-10-06,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-07,Amazon EC2,49.50,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-07,Amazon S3,14.10,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-07,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-07,AWS Lambda,4.60,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-07,Amazon CloudFront,7.80,USD,frontend-edge,cf-dist-app-prod,global
2026-10-07,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-08,Amazon EC2,48.00,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-08,Amazon S3,14.30,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-08,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-08,AWS Lambda,4.10,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-08,Amazon CloudFront,7.00,USD,frontend-edge,cf-dist-app-prod,global
2026-10-08,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-09,Amazon EC2,50.10,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-09,Amazon S3,14.70,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-09,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-09,AWS Lambda,4.40,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-09,Amazon CloudFront,7.30,USD,frontend-edge,cf-dist-app-prod,global
2026-10-09,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-10,Amazon EC2,49.20,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-10,Amazon S3,15.00,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-10,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-10,AWS Lambda,4.00,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-10,Amazon CloudFront,6.70,USD,frontend-edge,cf-dist-app-prod,global
2026-10-10,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-11,Amazon EC2,47.90,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-11,Amazon S3,15.20,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-11,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-11,AWS Lambda,3.80,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-11,Amazon CloudFront,6.50,USD,frontend-edge,cf-dist-app-prod,global
2026-10-11,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-12,Amazon EC2,50.80,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-12,Amazon S3,15.60,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-12,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-12,AWS Lambda,4.70,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-12,Amazon CloudFront,7.90,USD,frontend-edge,cf-dist-app-prod,global
2026-10-12,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-13,Amazon EC2,49.70,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-13,Amazon S3,16.00,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-13,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-13,AWS Lambda,4.50,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-13,Amazon CloudFront,7.60,USD,frontend-edge,cf-dist-app-prod,global
2026-10-13,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-14,Amazon EC2,51.30,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-14,Amazon S3,16.40,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-14,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-14,AWS Lambda,4.90,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-14,Amazon CloudFront,8.10,USD,frontend-edge,cf-dist-app-prod,global
2026-10-14,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-15,Amazon EC2,48.40,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-15,Amazon S3,16.80,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-15,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-15,AWS Lambda,4.30,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-15,Amazon CloudFront,7.20,USD,frontend-edge,cf-dist-app-prod,global
2026-10-15,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-16,Amazon EC2,50.00,USD,core-infrastructure,i-0a1b2c3d4e5f,us-east-1
2026-10-16,Amazon S3,17.10,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-16,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-16,AWS Lambda,4.60,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-16,Amazon CloudFront,7.70,USD,frontend-edge,cf-dist-app-prod,global
2026-10-16,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-17,Amazon EC2,342.80,USD,ai-research,i-gpu-training-unattached,us-east-1
2026-10-17,Amazon S3,17.50,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-17,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-17,AWS Lambda,4.80,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-17,Amazon CloudFront,8.00,USD,frontend-edge,cf-dist-app-prod,global
2026-10-17,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-18,Amazon EC2,358.10,USD,ai-research,i-gpu-training-unattached,us-east-1
2026-10-18,Amazon S3,17.90,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-18,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-18,AWS Lambda,4.50,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-18,Amazon CloudFront,7.80,USD,frontend-edge,cf-dist-app-prod,global
2026-10-18,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-19,Amazon EC2,371.40,USD,ai-research,i-gpu-training-unattached,us-east-1
2026-10-19,Amazon S3,18.20,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-19,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-19,AWS Lambda,4.70,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-19,Amazon CloudFront,8.30,USD,frontend-edge,cf-dist-app-prod,global
2026-10-19,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-20,Amazon EC2,365.00,USD,ai-research,i-gpu-training-unattached,us-east-1
2026-10-20,Amazon S3,18.60,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-20,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-20,AWS Lambda,4.60,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-20,Amazon CloudFront,8.10,USD,frontend-edge,cf-dist-app-prod,global
2026-10-20,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1
2026-10-21,Amazon EC2,382.50,USD,ai-research,i-gpu-training-unattached,us-east-1
2026-10-21,Amazon S3,19.00,USD,analytics-pipeline,data-lake-raw,us-east-1
2026-10-21,Amazon RDS,34.00,USD,core-infrastructure,prod-postgres-primary,us-east-1
2026-10-21,AWS Lambda,4.90,USD,frontend-edge,api-gateway-authorizer,us-east-1
2026-10-21,Amazon CloudFront,8.50,USD,frontend-edge,cf-dist-app-prod,global
2026-10-21,Amazon ElastiCache,18.50,USD,core-infrastructure,redis-cluster-session,us-east-1`.trim();

/**
 * A second CSV for testing upload transitions and dynamic updates during demo.
 * Spans a single week of moderate spending with no high-severity anomalies.
 */
export const SECOND_DEMO_CSV = `date,service,cost,currency,project,resourceId,region
2026-11-01,Google Compute Engine,65.00,USD,web-tier,gce-frontend-instance,us-central1
2026-11-01,Cloud Storage,22.00,USD,data-warehouse,gcs-coldline-archive,us-central1
2026-11-01,Cloud SQL,45.00,USD,db-cluster,cloudsql-mysql-prod,us-central1
2026-11-02,Google Compute Engine,66.20,USD,web-tier,gce-frontend-instance,us-central1
2026-11-02,Cloud Storage,22.10,USD,data-warehouse,gcs-coldline-archive,us-central1
2026-11-02,Cloud SQL,45.00,USD,db-cluster,cloudsql-mysql-prod,us-central1
2026-11-03,Google Compute Engine,64.80,USD,web-tier,gce-frontend-instance,us-central1
2026-11-03,Cloud Storage,22.30,USD,data-warehouse,gcs-coldline-archive,us-central1
2026-11-03,Cloud SQL,45.00,USD,db-cluster,cloudsql-mysql-prod,us-central1
2026-11-04,Google Compute Engine,67.00,USD,web-tier,gce-frontend-instance,us-central1
2026-11-04,Cloud Storage,22.50,USD,data-warehouse,gcs-coldline-archive,us-central1
2026-11-04,Cloud SQL,45.00,USD,db-cluster,cloudsql-mysql-prod,us-central1
2026-11-05,Google Compute Engine,65.40,USD,web-tier,gce-frontend-instance,us-central1
2026-11-05,Cloud Storage,22.80,USD,data-warehouse,gcs-coldline-archive,us-central1
2026-11-05,Cloud SQL,45.00,USD,db-cluster,cloudsql-mysql-prod,us-central1`.trim();
