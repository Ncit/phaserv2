#!/bin/bash

# Deploy Poker Server to Remote Machine
# Remote: 82.202.158.140
# Route: nikmobdev.ru/pokerserver
# SSH User: nikita

set -e

REMOTE_HOST="82.202.158.140"
REMOTE_USER="nikita"
REMOTE_PATH="/home/nikita/pokerserver"
REMOTE_ROUTE="nikmobdev.ru/pokerserver"
LOCAL_SERVER_DIR="server"

echo "🚀 Starting deployment to remote server..."
echo "📍 Remote: $REMOTE_HOST"
echo "👤 User: $REMOTE_USER"
echo "📁 Path: $REMOTE_PATH"
echo "🌐 Route: $REMOTE_ROUTE"

# Check if local server directory exists
if [ ! -d "$LOCAL_SERVER_DIR" ]; then
    echo "❌ Error: Local server directory not found: $LOCAL_SERVER_DIR"
    exit 1
fi

# Create remote directory structure
echo "📁 Creating remote directory structure..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_PATH"

# Copy server files to remote
echo "📤 Copying server files to remote..."
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '*.log' \
    $LOCAL_SERVER_DIR/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Copy package files
echo "📦 Copying package files..."
scp $LOCAL_SERVER_DIR/package.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/
scp $LOCAL_SERVER_DIR/package-lock.json $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Install dependencies on remote
echo "🔧 Installing dependencies on remote..."
ssh $REMOTE_USER@$REMOTE_HOST "cd $REMOTE_PATH && npm install --production"

# Create systemd service file for auto-start
echo "⚙️ Creating systemd service..."
cat > /tmp/pokerserver.service << EOF
[Unit]
Description=Poker Server
After=network.target

[Service]
Type=simple
User=nikita
WorkingDirectory=$REMOTE_PATH
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Copy service file to remote
scp /tmp/pokerserver.service $REMOTE_USER@$REMOTE_HOST:/tmp/

# Install and enable service (requires sudo)
echo "🔧 Installing systemd service..."
ssh $REMOTE_USER@$REMOTE_HOST "sudo cp /tmp/pokerserver.service /etc/systemd/system/ && sudo systemctl daemon-reload && sudo systemctl enable pokerserver.service"

# Create nginx configuration
echo "🌐 Creating nginx configuration..."
cat > /tmp/pokerserver-nginx.conf << EOF
server {
    listen 80;
    server_name nikmobdev.ru;

    location /pokerserver/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Copy nginx config to remote
scp /tmp/pokerserver-nginx.conf $REMOTE_USER@$REMOTE_HOST:/tmp/

# Install nginx config (requires sudo)
echo "🌐 Installing nginx configuration..."
ssh $REMOTE_USER@$REMOTE_HOST "sudo cp /tmp/pokerserver-nginx.conf /etc/nginx/sites-available/pokerserver && sudo ln -sf /etc/nginx/sites-available/pokerserver /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"

# Start the service
echo "🚀 Starting poker server service..."
ssh $REMOTE_USER@$REMOTE_HOST "sudo systemctl start pokerserver.service"

# Check service status
echo "📊 Checking service status..."
ssh $REMOTE_USER@$REMOTE_HOST "sudo systemctl status pokerserver.service --no-pager"

# Test the connection
echo "🧪 Testing server connection..."
sleep 5
if curl -s http://$REMOTE_HOST/pokerserver/ > /dev/null; then
    echo "✅ Server is responding!"
else
    echo "⚠️ Server might not be responding yet. Check logs with: ssh $REMOTE_USER@$REMOTE_HOST 'sudo journalctl -u pokerserver.service -f'"
fi

echo "🎉 Deployment completed!"
echo "🌐 Server URL: http://$REMOTE_ROUTE"
echo "📊 Monitor logs: ssh $REMOTE_USER@$REMOTE_HOST 'sudo journalctl -u pokerserver.service -f'"
echo "🔄 Restart service: ssh $REMOTE_USER@$REMOTE_HOST 'sudo systemctl restart pokerserver.service'"

# Clean up temporary files
rm -f /tmp/pokerserver.service /tmp/pokerserver-nginx.conf 