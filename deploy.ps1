#!/usr/bin/env pwsh
# Azure Container Registry Deployment Script
# This script automates the deployment process to Azure

param(
    [Parameter(Mandatory=$false)]
    [string]$RegistryName = "thiencontainers",
    
    [Parameter(Mandatory=$false)]
    [string]$ImageName = "gridstack",
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "prod"
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Azure Container Registry Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment (dev=development, prod=production)" -ForegroundColor Yellow
Write-Host ""

# Step 0: Check Azure CLI login and set subscription
Write-Host "[0/5] Checking Azure CLI login..." -ForegroundColor Yellow
az account show > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Azure!" -ForegroundColor Red
    Write-Host "Logging in..." -ForegroundColor Yellow
    az login --scope https://management.core.windows.net//.default
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed!" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ Azure CLI login verified!" -ForegroundColor Green

# Find and set the correct subscription for the ACR
Write-Host "[0.5/5] Finding correct subscription..." -ForegroundColor Yellow
$acrSubscription = az acr show --name $RegistryName --query "id" -o tsv 2>$null
if ($acrSubscription) {
    $subscriptionId = $acrSubscription.Split("/")[2]
    az account set --subscription $subscriptionId
    Write-Host "✅ Subscription set!" -ForegroundColor Green
}
Write-Host ""

# Step 1: Build Docker Image
Write-Host "[1/5] Building Docker image ($Environment configuration)..." -ForegroundColor Yellow
$fullImageName = "${RegistryName}.azurecr.io/${ImageName}:${Tag}"

# Check if docker-compose.yml exists and use it for consistency
if (Test-Path "docker-compose.yml") {
    Write-Host "Using docker-compose for build ($Environment)..." -ForegroundColor Cyan
    
    if ($Environment -eq "dev") {
        # Build dev configuration
        docker-compose build dev
        $localImageName = "wit-custom-widget-v1:latest"
        Write-Host "Building development image with hot reload..." -ForegroundColor Yellow
    } else {
        # Build prod configuration
        docker-compose build prod
        $localImageName = "wit-custom-widget-v1:latest"
    }
    
    docker tag $localImageName $fullImageName
} else {
    # Fallback to direct docker build
    if ($Environment -eq "dev" -and (Test-Path "Dockerfile.dev")) {
        Write-Host "Building development image from Dockerfile.dev..." -ForegroundColor Yellow
        docker build -f Dockerfile.dev -t $fullImageName .
    } else {
        docker build -t $fullImageName .
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 2: Enable admin user and login to Azure Container Registry
Write-Host "[2/5] Configuring ACR..." -ForegroundColor Yellow
az acr update --name $RegistryName --admin-enabled true > $null 2>&1
Write-Host "Logging into Azure Container Registry..." -ForegroundColor Yellow
az acr login --name $RegistryName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Login failed!" -ForegroundColor Red
    Write-Host "Make sure you're logged into Azure CLI with: az login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Login successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Push to Azure Container Registry
Write-Host "[3/5] Pushing image to Azure Container Registry..." -ForegroundColor Yellow
docker push $fullImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Push successful!" -ForegroundColor Green
Write-Host ""

# Step 4: Verify the image
Write-Host "[4/5] Verifying image in registry..." -ForegroundColor Yellow
az acr repository show --name $RegistryName --image $ImageName --query "registry" -o tsv
Write-Host "✅ Verification complete!" -ForegroundColor Green
Write-Host ""

# Step 5: Display summary
Write-Host "[5/5] Deployment Summary" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor White
Write-Host "Registry: $RegistryName" -ForegroundColor White
Write-Host "Image: $fullImageName" -ForegroundColor White
Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your Azure Web App to use this image" -ForegroundColor White
Write-Host "2. Deploy using: az webapp config container set --name <webapp-name> --resource-group <rg-name> --docker-custom-image-name $fullImageName" -ForegroundColor White
if ($Environment -eq "dev") {
    Write-Host ""
    Write-Host "⚠️  WARNING: You're deploying the DEVELOPMENT image!" -ForegroundColor Yellow
    Write-Host "   This includes dev dependencies and is not optimized for production." -ForegroundColor Yellow
    Write-Host "   Use -Environment prod for production deployments." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "View image tags: az acr repository show-tags --name $RegistryName --repository $ImageName" -ForegroundColor Cyan
Write-Host ""

