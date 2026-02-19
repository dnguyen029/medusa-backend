$PROJECT_ID = "medusa-store-backend"
$REGION = "us-west1"
$REPO = "medusa-repo"
$IMAGE = "us-west1-docker.pkg.dev/$PROJECT_ID/$REPO/medusa-backend:latest"
$DB_INSTANCE = "medusa-db"
$REDIS_IP = "10.192.47.155" # Hardcoded from earlier output
$CONNECTOR = "medusa-connector"

Write-Host "Deploying Medusa Backend to Google Cloud Run..." -ForegroundColor Green

# 0. Build and Push Image (Local Docker)
Write-Host "Building Docker Image..." -ForegroundColor Cyan
& gcloud auth configure-docker us-west1-docker.pkg.dev --quiet
& docker build -t $IMAGE .
& docker push $IMAGE

if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Build/Push Failed!" -ForegroundColor Red
    exit 1
}

# 1. Deploy Cloud Run Service
& gcloud run deploy medusa-backend `
    --image $IMAGE `
    --region $REGION `
    --add-cloudsql-instances "${PROJECT_ID}:${REGION}:${DB_INSTANCE}" `
    --vpc-connector $CONNECTOR `
    --allow-unauthenticated `
    --set-env-vars "DATABASE_URL=postgres://postgres:supersecret@/medusa?host=/cloudsql/${PROJECT_ID}:${REGION}:${DB_INSTANCE},REDIS_URL=redis://${REDIS_IP}:6379,JWT_SECRET=supersecret,COOKIE_SECRET=supersecret" `
    --quiet

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment Successful!" -ForegroundColor Green
    Write-Host "Your backend is live. Copy the URL above."
} else {
    Write-Host "Deployment Failed. Check logs above." -ForegroundColor Red
}
