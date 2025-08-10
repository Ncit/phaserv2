# Production Deployment Info

## Build Details
- Build Date: $(date)
- Build Script: build-production.sh
- Environment: Production

## Configuration
- Server URL: http://176.108.242.121:3000
- Client Domain: https://nikmobdev.ru/winlinepoker
- Debug Mode: Disabled
- Environment: Production

## Files
- Main Application: src/
- Assets: assets/
- Dependencies: dependencies/
- Configuration: production-config.js
- Web Server Configs: .htaccess, traefik.yml

## Deployment
1. Copy all files to /home/nikita/public_html/winlinepoker/
2. Set permissions: chmod -R 755 /home/nikita/public_html/winlinepoker/
3. Configure Traefik to serve the client
4. Ensure poker server is running on port 3000

## Verification
- Test client at: https://nikmobdev.ru/winlinepoker
- Test server at: http://176.108.242.121:3000
