# Deployment Usage Guide

This guide explains how to deploy the WIT Custom Widget application to Azure Container Registry using different configurations.

## Quick Reference

### Production Deployment (Default)

```powershell
# Deploy production build
.\deploy.ps1

# With custom parameters
.\deploy.ps1 -RegistryName "myregistry" -ImageName "myapp" -Tag "v1.0"
```

### Development Deployment

```powershell
# Deploy development build
.\deploy.ps1 -Environment dev

# Full example with all parameters
.\deploy.ps1 -RegistryName "thiencontainers" -ImageName "gridstack-dev" -Tag "dev" -Environment dev
```

## Parameters

| Parameter | Description | Default | Required |
|-----------|-------------|---------|----------|
| `-RegistryName` | Azure Container Registry name | `thiencontainers` | No |
| `-ImageName` | Name of the image in ACR | `gridstack` | No |
| `-Tag` | Image tag/version | `latest` | No |
| `-Environment` | Build environment: `dev` or `prod` | `prod` | No |

## Differences: Dev vs Prod

### Development Build (`-Environment dev`)
- Uses `Dockerfile.dev`
- Includes development dependencies
- Larger image size (~500MB)
- Includes hot reload support (if run locally)
- Not optimized for production
- ⚠️ **Warning shown during deployment**

### Production Build (`-Environment prod`)
- Uses `Dockerfile` (multi-stage build)
- No dev dependencies
- Smaller image size (~50MB)
- Optimized with nginx
- Production-ready
- ✅ **Recommended for production**

## Deployment Workflow

### Step 1: Build Locally
```powershell
# Test the build first
docker-compose build dev   # for development
docker-compose build prod  # for production
```

### Step 2: Deploy to Azure
```powershell
# Production deployment
.\deploy.ps1

# Development deployment
.\deploy.ps1 -Environment dev
```

### Step 3: Verify Deployment
```powershell
# View image tags
az acr repository show-tags --name thiencontainers --repository gridstack

# Check image details
az acr repository show --name thiencontainers --repository gridstack
```

## Common Use Cases

### 1. Deploy Production Version
```powershell
.\deploy.ps1 -Environment prod -Tag "v1.0"
```

### 2. Deploy Development Version for Testing
```powershell
.\deploy.ps1 -Environment dev -Tag "dev-latest"
```

### 3. Deploy to Different Registry
```powershell
.\deploy.ps1 -RegistryName "myregistry" -ImageName "myapp"
```

### 4. Deploy Specific Version
```powershell
.\deploy.ps1 -Tag "release-1.2.3"
```

## Azure Web App Deployment

After pushing to ACR, configure your Azure Web App:

### Option 1: Using Azure CLI
```powershell
az webapp config container set `
  --name <webapp-name> `
  --resource-group <resource-group-name> `
  --docker-custom-image-name thiencontainers.azurecr.io/gridstack:latest
```

### Option 2: Using Azure Portal
1. Go to Azure Portal → Web App → Deployment Center
2. Select "Container Registry" → "Azure Container Registry"
3. Choose your registry and image

## Troubleshooting

### Build Fails
```powershell
# Check if docker-compose is available
docker-compose --version

# Check logs
docker-compose build dev
```

### Push Fails
```powershell
# Verify Azure login
az login

# Check ACR credentials
az acr credential show --name thiencontainers

# Manually login to ACR
az acr login --name thiencontainers
```

### Image Not Found
```powershell
# List all images in registry
az acr repository list --name thiencontainers

# Check specific repository
az acr repository show --name thiencontainers --repository gridstack
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to Azure Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ secrets.ACR_NAME }}.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          dockerfile: Dockerfile
          push: true
          tags: |
            ${{ secrets.ACR_NAME }}.azurecr.io/${{ secrets.IMAGE_NAME }}:${{ github.sha }}
            ${{ secrets.ACR_NAME }}.azurecr.io/${{ secrets.IMAGE_NAME }}:latest
```

### Azure DevOps Pipeline Example
```yaml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  registryName: 'thiencontainers'
  imageName: 'gridstack'
  dockerRegistryServiceConnection: 'Azure Container Registry'

stages:
- stage: Build
  displayName: Build and Push
  jobs:
  - job: Docker
    displayName: Build Docker image
    steps:
    - task: Docker@2
      displayName: Build and push image
      inputs:
        command: buildAndPush
        repository: $(imageName)
        dockerfile: '**/Dockerfile'
        containerRegistry: $(dockerRegistryServiceConnection)
        tags: |
          $(Build.BuildId)
          latest
```

## Best Practices

1. **Use Production Builds for Azure**: Always deploy `-Environment prod` to production
2. **Tag Your Images**: Use meaningful tags like version numbers or git commit hashes
3. **Test Locally First**: Run `docker-compose build` before deploying
4. **Monitor Deployments**: Check logs and metrics after deployment
5. **Use Secrets**: Never hardcode credentials
6. **Automate Deployments**: Set up CI/CD pipelines

## Environment-Specific Deployments

### Development Environment
```powershell
.\deploy.ps1 -Environment dev -Tag "dev-$(Get-Date -Format 'yyyyMMdd')"
```

### Staging Environment
```powershell
.\deploy.ps1 -Environment prod -Tag "staging-$(Get-Date -Format 'yyyyMMdd')"
```

### Production Environment
```powershell
.\deploy.ps1 -Environment prod -Tag "prod-$env:VERSION"
```

## Summary

- **Production**: Use `.\deploy.ps1` or `.\deploy.ps1 -Environment prod`
- **Development**: Use `.\deploy.ps1 -Environment dev`
- Both configurations use docker-compose for consistency
- Script automatically handles Azure login and ACR push
- Includes warnings for development deployments to prevent mistakes

