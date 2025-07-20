# 🎮 Poker Game Server Load Testing Guide

## Overview

This guide provides comprehensive instructions for testing the workload and performance of your Poker Game WebSocket server under various load conditions.

## 🛠️ Tools Included

### 1. **Load Testing Tool** (`load-test.js`)
- Simulates multiple WebSocket connections
- Tests game actions (join, ready, fold, call, raise, chat)
- Provides detailed performance metrics
- Configurable test parameters

### 2. **Server Monitor** (`server-monitor.js`)
- Monitors server CPU, memory, and network usage
- Real-time performance tracking
- Generates CSV reports
- Performance assessment and recommendations

## 📋 Prerequisites

### Install Dependencies
```bash
# Install load testing dependencies
npm install ws

# Or use the provided package.json
cp load-test-package.json package.json
npm install
```

### Server Setup
1. **Start your poker game server**
   ```bash
   cd pokerv2/server
   npm start
   ```

2. **Verify server is running**
   - Check server logs for successful startup
   - Ensure WebSocket endpoint is accessible
   - Default URL: `ws://localhost:3000`

## 🚀 Quick Start

### Basic Load Test
```bash
# Run a basic load test (100 connections, 60 seconds)
node load-test.js

# Light test (10 connections, 30 seconds)
npm run test:light

# Medium test (50 connections, 60 seconds)
npm run test:medium

# Heavy test (200 connections, 120 seconds)
npm run test:heavy
```

### Custom Load Test
```bash
# Custom server URL
node load-test.js --url=ws://your-server.com:3000

# Custom number of connections
node load-test.js --connections=500

# Custom test duration
node load-test.js --duration=180000

# Combined custom test
node load-test.js --url=ws://localhost:3000 --connections=200 --duration=120000
```

## 📊 Test Scenarios

### 1. **Light Load Test** (Development)
```bash
npm run test:light
```
- **Purpose**: Verify basic functionality
- **Connections**: 10
- **Duration**: 30 seconds
- **Expected**: 95%+ success rate

### 2. **Medium Load Test** (Staging)
```bash
npm run test:medium
```
- **Purpose**: Test normal usage patterns
- **Connections**: 50
- **Duration**: 60 seconds
- **Expected**: 90%+ success rate

### 3. **Heavy Load Test** (Production)
```bash
npm run test:heavy
```
- **Purpose**: Test high traffic scenarios
- **Connections**: 200
- **Duration**: 120 seconds
- **Expected**: 85%+ success rate

### 4. **Stress Test** (Breaking Point)
```bash
npm run test:stress
```
- **Purpose**: Find server limits
- **Connections**: 500
- **Duration**: 180 seconds
- **Expected**: Variable results

## 🔍 Server Monitoring

### Start Monitoring
```bash
# Start monitoring in a separate terminal
node server-monitor.js

# With custom log file
node server-monitor.js --log=my-test.log
```

### Monitor During Load Test
1. **Terminal 1**: Start server monitoring
   ```bash
   node server-monitor.js
   ```

2. **Terminal 2**: Run load test
   ```bash
   node load-test.js --connections=100
   ```

3. **Terminal 3**: Watch server logs
   ```bash
   tail -f server.log
   ```

## 📈 Understanding Results

### Load Test Metrics

#### **Connection Statistics**
- **Total Attempted**: Number of connection attempts
- **Successful**: Successfully established connections
- **Failed**: Failed connection attempts
- **Success Rate**: Percentage of successful connections
- **Active at End**: Connections still active when test ended

#### **Message Statistics**
- **Sent**: Total messages sent to server
- **Received**: Total messages received from server
- **Errors**: Message transmission errors

#### **Game Statistics**
- **Games Joined**: Number of games successfully joined
- **Active Games**: Games active at test end

#### **Action Statistics**
- **Total Actions**: Total game actions attempted
- **Successful**: Successfully processed actions
- **Failed**: Failed action attempts
- **Success Rate**: Percentage of successful actions

#### **Performance Metrics**
- **Average Response Time**: Mean response time in milliseconds
- **Minimum Response Time**: Fastest response time
- **Maximum Response Time**: Slowest response time
- **Connections/Second**: Connection establishment rate
- **Messages/Second**: Message throughput

### Performance Assessment

#### **Excellent Performance** ✅
- Connection Success Rate: ≥95%
- Action Success Rate: ≥90%
- Average Response Time: <100ms

#### **Good Performance** 🟡
- Connection Success Rate: ≥90%
- Action Success Rate: ≥80%
- Average Response Time: <200ms

#### **Acceptable Performance** 🟠
- Connection Success Rate: ≥80%
- Action Success Rate: ≥70%
- Average Response Time: <500ms

#### **Poor Performance** 🔴
- Connection Success Rate: <80%
- Action Success Rate: <70%
- Average Response Time: >500ms

### Server Monitor Metrics

#### **CPU Usage**
- **🟢 Good**: <50%
- **🟡 Warning**: 50-80%
- **🔴 Critical**: >80%

#### **Memory Usage**
- **🟢 Good**: <1GB
- **🟡 Warning**: 1-2GB
- **🔴 Critical**: >2GB

#### **System Load**
- **🟢 Good**: <1.0
- **🟡 Warning**: 1.0-5.0
- **🔴 Critical**: >5.0

## 🛠️ Troubleshooting

### Common Issues

#### **Connection Failures**
```bash
# Check if server is running
curl http://localhost:3000/health

# Check WebSocket endpoint
wscat -c ws://localhost:3000
```

#### **High Error Rates**
1. **Check server logs** for specific error messages
2. **Verify server configuration** (ports, limits)
3. **Check system resources** (CPU, memory, file descriptors)

#### **Slow Response Times**
1. **Monitor server resources** during test
2. **Check database connections** if applicable
3. **Review game logic** for performance bottlenecks

### Performance Optimization

#### **Server-Side Optimizations**
```javascript
// Increase WebSocket connection limits
const server = new WebSocket.Server({
    port: 3000,
    maxPayload: 1024 * 1024, // 1MB
    perMessageDeflate: false // Disable compression for performance
});

// Implement connection pooling
const connectionPool = new Map();
const MAX_CONNECTIONS = 1000;

// Add rate limiting
const rateLimiter = new Map();
const RATE_LIMIT = 100; // messages per second
```

#### **System Optimizations**
```bash
# Increase file descriptor limits (Linux)
ulimit -n 65536

# Optimize TCP settings
echo 'net.core.somaxconn = 65535' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 65535' >> /etc/sysctl.conf
sysctl -p
```

## 📋 Test Checklist

### Before Testing
- [ ] Server is running and healthy
- [ ] Dependencies are installed
- [ ] Test environment is isolated
- [ ] Monitoring tools are ready
- [ ] Baseline metrics are recorded

### During Testing
- [ ] Monitor server resources
- [ ] Watch for error messages
- [ ] Track connection success rates
- [ ] Monitor response times
- [ ] Check for memory leaks

### After Testing
- [ ] Review all metrics
- [ ] Analyze error logs
- [ ] Generate performance report
- [ ] Document findings
- [ ] Plan optimizations if needed

## 📊 Sample Test Results

### Light Load Test Example
```
📊 LOAD TEST RESULTS
============================================================

⏱️  Test Duration: 30000ms (30.0s)
🎯 Target Connections: 10
🌐 Server URL: ws://localhost:3000

📈 CONNECTION STATISTICS:
   Total Attempted: 10
   Successful: 10
   Failed: 0
   Success Rate: 100.0%
   Active at End: 10

💬 MESSAGE STATISTICS:
   Sent: 45
   Received: 45
   Errors: 0

🎮 GAME STATISTICS:
   Games Joined: 10
   Active Games: 2

⚡ ACTION STATISTICS:
   Total Actions: 35
   Successful: 35
   Failed: 0
   Success Rate: 100.0%

🚀 PERFORMANCE METRICS:
   Average Response Time: 12.3ms
   Minimum Response Time: 8ms
   Maximum Response Time: 25ms
   Connections/Second: 0.3
   Messages/Second: 1.5

📊 PERFORMANCE ASSESSMENT:
✅ EXCELLENT: Server handles load very well
```

## 🔧 Advanced Testing

### Custom Test Scenarios
```javascript
// Modify load-test.js for custom scenarios
const CONFIG = {
    serverUrl: 'ws://localhost:3000',
    testDuration: 120000, // 2 minutes
    connectionInterval: 50, // Faster connections
    maxConnections: 300,
    gameActions: {
        joinGame: true,
        ready: true,
        fold: true,
        call: true,
        raise: true,
        chat: false // Disable chat for performance test
    },
    actionInterval: {
        min: 500, // Faster actions
        max: 2000
    }
};
```

### Continuous Testing
```bash
# Run tests in a loop
for i in {1..5}; do
    echo "Test run $i"
    node load-test.js --connections=50 --duration=60000
    sleep 30
done
```

### Load Testing Script
```bash
#!/bin/bash
# automated-load-test.sh

echo "Starting automated load test suite..."

# Light test
echo "Running light load test..."
node load-test.js --connections=10 --duration=30000 > light-test.log 2>&1

# Medium test
echo "Running medium load test..."
node load-test.js --connections=50 --duration=60000 > medium-test.log 2>&1

# Heavy test
echo "Running heavy load test..."
node load-test.js --connections=200 --duration=120000 > heavy-test.log 2>&1

echo "Load test suite completed. Check logs for results."
```

## 📞 Support

For issues or questions about load testing:
- **Email**: support@example.com
- **Telegram**: @poker_support
- **Website**: https://github.com/Ncit/phaserv2

## 📚 Additional Resources

- [WebSocket Load Testing Best Practices](https://websocket.org/echo.html)
- [Node.js Performance Optimization](https://nodejs.org/en/docs/guides/performance/)
- [Server Monitoring Tools](https://github.com/topics/server-monitoring) 