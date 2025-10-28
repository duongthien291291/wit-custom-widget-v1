# Azure Container Registry Deployment Guide

This guide provides step-by-step instructions to deploy the WIT Custom Widget Dashboard to Azure Container Registry and Azure Web App.

## Prerequisites

- Azure CLI installed and configured
- Docker installed and running
- Access to Azure Container Registry: `thiencontainers.azurecr.io`

## Deployment Steps

### Step 1: Build the Docker Image

Build the Docker image locally to verify it works:

```bash
docker build -t thiencontainers.azurecr.io/gridstack:latest .
```

**Note**: Replace `thiencontainers` with your actual registry name.

### Step 2: Test the Docker Image Locally (Optional)

Run the container locally to ensure it works:

```bash
docker run -d -p 8080:80 --name gridstack-test thiencontainers.azurecr.io/gridstack:latest
```

Visit `http://localhost:8080` to verify the application is working. Stop and remove the test container:

```bash
docker stop gridstack-test
docker rm gridstack-test
```

### Step 3: Login to Azure Container Registry

Login to your Azure Container Registry:

```bash
az acr login --name thiencontainers
```

If you haven't logged in to Azure CLI:

```bash
az login
```

### Step 4: Push Image to Azure Container Registry

Push the image to your Azure Container Registry:

```bash
docker push thiencontainers.azurecr.io/gridstack:latest
```

### Step 5: Deploy to Azure Web App

If you haven't already created an Azure Web App, create one:

```bash
az webapp create \
  --name <your-webapp-name> \
  --resource-group <your-resource-group> \
  --plan <your-app-service-plan> \
  --deployment-container-image-name thiencontainers.azurecr.io/gridstack:latest
```

### Step 6: Configure Container Settings

Enable continuous deployment and set the container settings:

```bash
# Enable managed identity (for ACR access without credentials)
az webapp identity assign \
  --name <your-webapp-name> \
  --resource-group <your-resource-group>

# Grant AcrPull role to the managed identity
az role assignment create \
  --assignee <principal-id> \
  --role AcrPull \
  --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group>/providers/Microsoft.ContainerRegistry/registries/thiencontainers

# Set the container configuration
az webapp config container set \
  --name <your-webapp-name> \
  --resource-group <your-resource-group> \
  --docker-custom-image-name thiencontainers.azurecr.io/gridstack:latest \
  --docker-registry-server-url https://thiencontainers.azurecr.io
```

### Step 7: Configure Application Settings (Optional)

Set any required environment variables:

```bash
az webapp config appsettings set \
  --name <your-webapp-name> \
  --resource-group <your-resource-group> \
  --settings WEBSITES_PORT=80
```

### Step 8: Restart the Web App

Restart the web app to apply the new configuration:

```bash
az webapp restart \
  --name <your-webapp-name> \
  --resource-group <your-resource-group>
```

## Verification

1. Check the deployment status:
```bash
az webapp show \
  --name <your-webapp-name> \
  --resource-group <your-resource-group> \
  --query state
```

2. View the web app logs:
```bash
az webapp log tail \
  --name <your-webapp-name> \
  --resource-group <your-resource-group>
```

3. Access your application at:
```
https://<your-webapp-name>.azurewebsites.net
```

## Troubleshooting

### Container fails to start
- Check logs: `az webapp log tail --name <your-webapp-name> --resource-group <your-resource-group>`
- Verify container registry permissions
- Check if the image exists: `az acr repository show-tags --name thiencontainers --repository gridstack`

### Permission errors
- Ensure managed identity has `AcrPull` role on the container registry
- Verify container registry admin user is disabled (use managed identity instead)

### Build errors
- Ensure Docker is running
- Check Dockerfile syntax
- Verify all required files are present

### Image pull errors
- Verify image exists in ACR: `az acr repository list --name thiencontainers`
- Check network connectivity to Azure
- Verify you're logged in: `az acr login --name thiencontainers`

## Continuous Deployment

For continuous deployment, you can:

1. **Use Azure DevOps Pipeline**:
   - Create a pipeline that builds and pushes to ACR on each commit
   - The web app can be configured to auto-deploy from ACR

2. **Use GitHub Actions**:
   - Create a workflow that builds and pushes to ACR
   - Trigger on push to main branch

3. **Manual deployment**:
   - Rebuild and push the image
   - Restart the web app

## Security Best Practices

1. **Use Managed Identity** instead of admin credentials
2. **Enable HTTPS** and redirect HTTP to HTTPS
3. **Regularly update** base images for security patches
4. **Scan images** for vulnerabilities using Azure Security Center
5. **Set appropriate resource limits** for containers
6. **Use private endpoints** for ACR in production environments

## Monitoring

Monitor your application using:

- **Application Insights**: `az monitor app-insights component create --app <insights-name> -l <location> -g <resource-group>`
- **Azure Monitor**: View logs and metrics
- **Container Insights**: Monitor container performance

## Additional Commands

### Tag and push specific version
```bash
docker tag gridstack:latest thiencontainers.azurecr.io/gridstack:v1.0.0
docker push thiencontainers.azurecr.io/gridstack:v1.0.0
```

### List images in ACR
```bash
az acr repository list --name thiencontainers
az acr repository show-tags --name thiencontainers --repository gridstack
```

### View web app configuration
```bash
az webapp config show --name <your-webapp-name> --resource-group <your-resource-group>
```

## Support

For issues or questions:
- Check Azure documentation: https://docs.microsoft.com/azure/app-service
- Review container logs in Azure Portal
- Check ACR for image availability

