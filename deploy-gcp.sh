#!/bin/bash
# GCP Deployment Script for ACC-DEV
# Prerequisites: gcloud CLI installed and authenticated

set -e

# Configuration - UPDATE THESE
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="acc-dev-backend"
CLOUD_SQL_INSTANCE="acc-dev-db"
BUCKET_NAME="acc-dev-storage"

echo "🚀 Starting GCP Deployment..."

# 1. Enable required APIs
echo "📦 Enabling GCP APIs..."
gcloud services enable \
  sqladmin.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  storage.googleapis.com \
  --project=$PROJECT_ID

# 2. Create Cloud SQL Instance (PostgreSQL)
echo "🗄️ Creating Cloud SQL instance..."
gcloud sql instances create $CLOUD_SQL_INSTANCE \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --project=$PROJECT_ID \
  --root-password="$(openssl rand -base64 24)" \
  || echo "Instance may already exist"

# Create database
gcloud sql databases create acc_dev \
  --instance=$CLOUD_SQL_INSTANCE \
  --project=$PROJECT_ID \
  || echo "Database may already exist"

# 3. Create Cloud Storage Bucket
echo "📁 Creating Cloud Storage bucket..."
gcloud storage buckets create gs://$BUCKET_NAME \
  --location=$REGION \
  --project=$PROJECT_ID \
  --uniform-bucket-level-access \
  || echo "Bucket may already exist"

# Make bucket public for item images
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
  --member=allUsers \
  --role=roles/storage.objectViewer

# 4. Build and deploy backend to Cloud Run
echo "🔨 Building and deploying backend..."
cd backend

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region=$REGION \
  --project=$PROJECT_ID \
  --allow-unauthenticated \
  --add-cloudsql-instances=$PROJECT_ID:$REGION:$CLOUD_SQL_INSTANCE \
  --set-env-vars="DATABASE_URL=postgres://postgres:YOUR_DB_PASSWORD@localhost/acc_dev?host=/cloudsql/$PROJECT_ID:$REGION:$CLOUD_SQL_INSTANCE" \
  --set-env-vars="JWT_SECRET=YOUR_JWT_SECRET" \
  --set-env-vars="GCS_BUCKET_NAME=$BUCKET_NAME"

echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Update the following:"
echo "   1. Replace YOUR_DB_PASSWORD with your Cloud SQL password"
echo "   2. Replace YOUR_JWT_SECRET with a secure random string"
echo "   3. Run the schema against Cloud SQL:"
echo "      gcloud sql connect $CLOUD_SQL_INSTANCE --user=postgres < ../cloudsql-schema.sql"
