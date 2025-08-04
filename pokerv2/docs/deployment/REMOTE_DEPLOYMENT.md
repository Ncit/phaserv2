# Remote Server Deployment Guide

This guide explains how to deploy the poker server to the remote machine and configure the client to connect to it.

## Remote Server Details

- **IP Address**: 82.202.158.140
- **Domain**: nikmobdev.ru
- **Route**: nikmobdev.ru/pokerserver
- **SSH User**: nikita
- **Server Path**: /home/nikita/pokerserver

## Deployment Process

### 1. Automatic Deployment

Use the provided deployment script:

```bash
./pokerv2/scripts/deploy-to-remote.sh
```

This script will:
- Copy server files to the remote machine
- Install dependencies
- Create a systemd service for auto-start
- Configure nginx for the `/pokerserver` route
- Start the service

### 2. Manual Deployment Steps

If you prefer to deploy manually:

#### Step 1: Copy Files
```bash
# Create remote directory
ssh nikita@82.202.158.140 "mkdir -p /home/nikita/pokerserver"

# Copy server files
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '*.log' \
    pokerv2/server/ nikita@82.202.158.140:/home/nikita/pokerserver/
```

#### Step 2: Install Dependencies
```bash
ssh nikita@82.202.158.140 "cd /home/nikita/pokerserver && npm install --production"
```

#### Step 3: Create Systemd Service
Create `/etc/systemd/system/pokerserver.service`:
```ini
[Unit]
Description=Poker Server
After=network.target

[Service]
Type=simple
User=nikita
WorkingDirectory=/home/nikita/pokerserver
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
```

#### Step 4: Configure Nginx
Create `/etc/nginx/sites-available/pokerserver`:
```nginx
server {
    listen 80;
    server_name nikmobdev.ru;

    location /pokerserver/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 5: Enable and Start Services
```bash
# Enable nginx site
sudo ln -sf /etc/nginx/sites-available/pokerserver /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Enable and start poker server
sudo systemctl daemon-reload
sudo systemctl enable pokerserver.service
sudo systemctl start pokerserver.service
```

## Client Configuration

The client has been updated to use the remote server for all environments:

### Server URL Configuration

All environments now connect to the remote server:

- **Development**: `https://nikmobdev.ru/pokerserver`
- **VKontakte**: `https://nikmobdev.ru/pokerserver`
- **Telegram**: `https://nikmobdev.ru/pokerserver`

### Testing Connection

Test the remote connection:

```bash
./pokerv2/scripts/test-remote-connection.sh
```

## Monitoring and Maintenance

### Check Service Status
```bash
ssh nikita@82.202.158.140 "sudo systemctl status pokerserver.service"
```

### View Logs
```bash
ssh nikita@82.202.158.140 "sudo journalctl -u pokerserver.service -f"
```

### Restart Service
```bash
ssh nikita@82.202.158.140 "sudo systemctl restart pokerserver.service"
```

### Update Server
```bash
# Run the deployment script again
./pokerv2/scripts/deploy-to-remote.sh
```

## Troubleshooting

### Common Issues

1. **Service won't start**: Check logs with `journalctl -u pokerserver.service`
2. **Nginx errors**: Check nginx configuration with `nginx -t`
3. **Connection refused**: Verify the service is running and port 3000 is accessible
4. **WebSocket issues**: Check if nginx is properly configured for WebSocket upgrades

### Debug Commands

```bash
# Check if port 3000 is listening
ssh nikita@82.202.158.140 "netstat -tlnp | grep :3000"

# Check nginx configuration
ssh nikita@82.202.158.140 "sudo nginx -t"

# Check service logs
ssh nikita@82.202.158.140 "sudo journalctl -u pokerserver.service --no-pager -n 50"
```

## Security Considerations

- The server runs on port 3000 internally
- Nginx handles external access and SSL termination
- The service runs as user `nikita` with limited permissions
- Automatic restart is enabled for reliability

## Environment Variables

The server uses these environment variables:
- `NODE_ENV=production`
- `PORT=3000`

You can modify these in the systemd service file if needed. 