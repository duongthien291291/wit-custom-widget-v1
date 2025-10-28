# Docker Setup Guide

This guide explains how to run the WIT Custom Widget application using Docker with hot reload support for development.

## Quick Start

### Development with Hot Reload

Start the development environment with hot reload enabled:

```bash
# Build and run development container
docker-compose up dev

# Or using npm script
npm run docker:dev
```

Access the application at: **http://localhost:3000**

**Features:**
- ✅ Hot module replacement (HMR)
- ✅ Live code reloading
- ✅ Volume mounts for automatic sync
- ✅ Automatic container restart on failure

### Production Build

Run the production-ready optimized container:

```bash
# Start production container
docker-compose up prod

# Or using npm script
npm run docker:prod

# Run in background
docker-compose up -d prod
```

Access the application at: **http://localhost:80**

## Architecture

### Development Container (`dev` service)

- **Base Image**: `node:18-alpine`
- **Port**: 3000
- **Volumes**: Source code mounted for hot reload
- **Command**: Runs `npm run dev` with Vite dev server
- **Features**: 
  - Hot reload enabled
  - Source code changes reflected immediately
  - File polling for volume sync

### Production Container (`prod` service)

- **Base Image**: Multi-stage build (node:18-alpine → nginx:alpine)
- **Port**: 80
- **Build Process**: TypeScript compilation + Vite build
- **Server**: Nginx with optimized configuration
- **Features**:
  - Optimized production build
  - Static asset caching
  - Gzip compression
  - Security headers
  - Health checks

## Volume Mounts (Development)

The development container mounts the following directories for hot reload:

```yaml
volumes:
  - ./src:/app/src                    # Source code
  - ./index.html:/app/index.html      # Entry HTML
  - ./vite.config.ts:/app/vite.config.ts
  - ./tsconfig.json:/app/tsconfig.json
  - ./tsconfig.node.json:/app/tsconfig.node.json
  - /app/node_modules                 # Anonymous volume (excluded)
```

**Important**: `node_modules` is not mounted to avoid conflicts between host and container.

## Vite Configuration for Docker

The Vite server is configured to work with Docker:

```typescript
server: {
  port: 3000,
  host: true,        // Listen on all addresses (0.0.0.0)
  watch: {
    usePolling: true // Enable polling for file changes in Docker
  }
}
```

## Common Commands

### Service Management

```bash
# Start services
docker-compose up dev              # Development
docker-compose up prod             # Production
docker-compose up                  # All services

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart dev

# Stop and remove volumes
docker-compose down -v
```

### Building

```bash
# Build development image
docker-compose build dev

# Build production image
docker-compose build prod

# Build without cache
docker-compose build --no-cache dev
```

### Logs and Debugging

```bash
# View logs
docker-compose logs dev
docker-compose logs prod

# Follow logs (real-time)
docker-compose logs -f dev

# View last 100 lines
docker-compose logs --tail=100 dev
```

### Container Management

```bash
# List running containers
docker ps

# Access container shell
docker exec -it wit-widget-dev sh

# Check container health
docker inspect wit-widget-dev

# View resource usage
docker stats
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes and networks
docker-compose down -v --remove-orphans

# Remove images
docker-compose down --rmi all

# Complete cleanup (containers, volumes, networks, images)
docker system prune -a
```

## Troubleshooting

### Hot Reload Not Working

**Problem**: Changes to files don't trigger hot reload.

**Solutions**:
1. Ensure volumes are properly mounted:
   ```bash
   docker-compose config
   ```

2. Check file permissions:
   ```bash
   docker exec -it wit-widget-dev ls -la /app/src
   ```

3. Restart the container:
   ```bash
   docker-compose restart dev
   ```

### Port Already in Use

**Problem**: Port 3000 or 80 already in use.

**Solutions**:
1. Stop the conflicting service
2. Change port in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Host:Container
   ```

### Container Won't Start

**Problem**: Container exits immediately.

**Solutions**:
1. Check logs:
   ```bash
   docker-compose logs dev
   ```

2. Run interactively to see errors:
   ```bash
   docker-compose run dev sh
   ```

3. Verify Dockerfile and dependencies

### Slow Hot Reload

**Problem**: Hot reload is working but slow.

**Solutions**:
1. Exclude unnecessary files in `.dockerignore.dev`
2. Use `.dockerignore.dev` for development builds
3. Check Docker resource allocation

### File Changes Not Reflected

**Problem**: Files changed but browser doesn't update.

**Solutions**:
1. Check if Vite is running:
   ```bash
   docker exec -it wit-widget-dev curl http://localhost:3000
   ```

2. Check network configuration in `vite.config.ts`
3. Ensure `host: true` is set in Vite config
4. Hard refresh browser (Ctrl+F5)

## Network Configuration

Both services are connected to the `wit-widget-network` bridge network:

```yaml
networks:
  wit-widget-network:
    driver: bridge
```

This allows:
- Service-to-service communication
- Isolated Docker network
- Easy scaling and management

## Health Checks

### Development Service
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1
```

### Production Service
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

Check health status:
```bash
docker ps  # Shows health status
docker inspect wit-widget-dev | grep -A 5 Health
```

## Performance Considerations

### Development
- Use SSD for Docker volumes for better performance
- Allocate sufficient CPU/memory to Docker
- Consider using WSL2 on Windows

### Production
- Multi-stage build reduces image size
- Nginx serves static files efficiently
- Caching headers reduce bandwidth usage
- Gzip compression enabled

## Security Best Practices

1. **Never commit sensitive data** - Use environment variables
2. **Use non-root user** in containers (future enhancement)
3. **Keep images updated** - Security patches
4. **Use .dockerignore** - Exclude unnecessary files
5. **Health checks** - Monitor container health
6. **Network isolation** - Separate networks for different environments

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: docker-compose build prod
      - name: Run tests
        run: docker-compose run --rm prod npm test
      - name: Deploy
        run: |
          docker push <your-registry>/wit-widget
```

## Advanced Configuration

### Environment Variables

Create `.env` file for custom configuration:

```env
# Development
NODE_ENV=development
VITE_API_URL=http://localhost:8080

# Production
PORT=80
NGINX_WORKER_PROCESSES=auto
```

Use in `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=${NODE_ENV:-development}
```

### Multi-stage Production Builds

The production Dockerfile uses multi-stage builds:

1. **Builder stage**: Install dependencies and build
2. **Production stage**: Copy built assets to nginx

This results in a smaller final image (~50MB vs ~500MB).

## Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Vite Docker Setup](https://vitejs.dev/guide/docker.html)
- [Preact Documentation](https://preactjs.com/)
- [Nginx Configuration](https://nginx.org/en/docs/)

