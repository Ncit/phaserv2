#!/bin/bash

# Test Remote Server Connection
# Tests the connection to the remote poker server

REMOTE_HOST="82.202.158.140"
REMOTE_ROUTE="nikmobdev.ru/pokerserver"

echo "🧪 Testing remote server connection..."
echo "📍 Remote: $REMOTE_HOST"
echo "🌐 Route: $REMOTE_ROUTE"

# Test HTTPS connection
echo "📡 Testing HTTPS connection..."
if curl -s -k -o /dev/null -w "%{http_code}" https://$REMOTE_ROUTE/ | grep -q "200\|404"; then
    echo "✅ HTTPS connection successful"
else
    echo "❌ HTTPS connection failed"
fi

# Test WebSocket connection (basic test)
echo "🔌 Testing WebSocket connection..."
if curl -s -k https://$REMOTE_ROUTE/socket.io/ | grep -q "Transport unknown"; then
    echo "✅ Socket.IO server responding"
else
    echo "⚠️ Socket.IO server not responding"
fi

# Test API endpoint
echo "📋 Testing API endpoint..."
if curl -s -k https://$REMOTE_ROUTE/api/game | grep -q "playerCount"; then
    echo "✅ API endpoint responding"
else
    echo "❌ API endpoint not responding"
fi

echo "🎉 Connection test completed!" 