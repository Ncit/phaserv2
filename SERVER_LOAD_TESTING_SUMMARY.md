# 🎮 Server Load Testing System - Complete Setup

## ✅ **What's Been Created**

### **📁 Files Created**

#### **1. Load Testing Tools**
- **`load-test.js`** - Main load testing script with WebSocket simulation
- **`server-monitor.js`** - Server performance monitoring tool
- **`quick-test.sh`** - Easy-to-use command-line interface
- **`load-test-package.json`** - Dependencies configuration

#### **2. Documentation**
- **`LOAD_TESTING_GUIDE.md`** - Comprehensive testing guide
- **`SERVER_LOAD_TESTING_SUMMARY.md`** - This summary document

#### **3. Dependencies**
- **`node_modules/ws/`** - WebSocket library for Node.js
- **`package.json`** - Project dependencies

## 🚀 **Quick Start Guide**

### **1. Install Dependencies**
```bash
npm install ws
```

### **2. Start Your Server**
```bash
cd pokerv2/server
npm start
```

### **3. Run Load Tests**

#### **Easy Commands**
```bash
# Light test (10 connections, 30 seconds)
./quick-test.sh light

# Medium test (50 connections, 60 seconds)
./quick-test.sh medium

# Heavy test (200 connections, 120 seconds)
./quick-test.sh heavy

# Stress test (500 connections, 180 seconds)
./quick-test.sh stress
```

#### **Custom Tests**
```bash
# Custom server URL
./quick-test.sh custom --server=ws://my-server.com:3000

# Custom parameters
./quick-test.sh custom --connections=100 --duration=90000

# Full test suite with monitoring
./quick-test.sh full
```

#### **Direct Node.js Commands**
```bash
# Basic test
node load-test.js

# Custom test
node load-test.js --url=ws://localhost:3000 --connections=200 --duration=120000

# Help
node load-test.js --help
```

### **4. Monitor Server Performance**
```bash
# Start monitoring
./quick-test.sh monitor

# Stop monitoring
./quick-test.sh stop

# Or use directly
node server-monitor.js --log=my-test.log
```

## 📊 **What Gets Tested**

### **Connection Testing**
- ✅ WebSocket connection establishment
- ✅ Connection stability over time
- ✅ Connection limits and timeouts
- ✅ Reconnection handling

### **Game Actions Testing**
- ✅ Join game functionality
- ✅ Set ready status
- ✅ Poker actions (fold, call, raise)
- ✅ Chat messaging
- ✅ Game state synchronization

### **Performance Metrics**
- ✅ Connection success rate
- ✅ Message throughput
- ✅ Response times
- ✅ Error rates
- ✅ Server resource usage

### **Server Monitoring**
- ✅ CPU usage
- ✅ Memory consumption
- ✅ System load
- ✅ Network connections
- ✅ Real-time performance tracking

## 🎯 **Test Scenarios**

### **Light Load** (Development)
- **Connections**: 10
- **Duration**: 30 seconds
- **Purpose**: Basic functionality verification
- **Expected**: 95%+ success rate

### **Medium Load** (Staging)
- **Connections**: 50
- **Duration**: 60 seconds
- **Purpose**: Normal usage patterns
- **Expected**: 90%+ success rate

### **Heavy Load** (Production)
- **Connections**: 200
- **Duration**: 120 seconds
- **Purpose**: High traffic scenarios
- **Expected**: 85%+ success rate

### **Stress Test** (Breaking Point)
- **Connections**: 500
- **Duration**: 180 seconds
- **Purpose**: Find server limits
- **Expected**: Variable results

## 📈 **Understanding Results**

### **Performance Assessment**

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

### **Server Monitor Metrics**

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

## 🛠️ **Advanced Usage**

### **Custom Test Configuration**
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

### **Continuous Testing**
```bash
# Run tests in a loop
for i in {1..5}; do
    echo "Test run $i"
    ./quick-test.sh medium
    sleep 30
done
```

### **Automated Test Suite**
```bash
#!/bin/bash
# automated-load-test.sh

echo "Starting automated load test suite..."

# Light test
echo "Running light load test..."
./quick-test.sh light > light-test.log 2>&1

# Medium test
echo "Running medium load test..."
./quick-test.sh medium > medium-test.log 2>&1

# Heavy test
echo "Running heavy load test..."
./quick-test.sh heavy > heavy-test.log 2>&1

echo "Load test suite completed. Check logs for results."
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Connection Failures**
```bash
# Check if server is running
curl http://localhost:3000/health

# Check WebSocket endpoint
wscat -c ws://localhost:3000
```

#### **High Error Rates**
1. Check server logs for specific error messages
2. Verify server configuration (ports, limits)
3. Check system resources (CPU, memory, file descriptors)

#### **Slow Response Times**
1. Monitor server resources during test
2. Check database connections if applicable
3. Review game logic for performance bottlenecks

### **Performance Optimization**

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

## 📋 **Test Checklist**

### **Before Testing**
- [ ] Server is running and healthy
- [ ] Dependencies are installed (`npm install ws`)
- [ ] Test environment is isolated
- [ ] Monitoring tools are ready
- [ ] Baseline metrics are recorded

### **During Testing**
- [ ] Monitor server resources
- [ ] Watch for error messages
- [ ] Track connection success rates
- [ ] Monitor response times
- [ ] Check for memory leaks

### **After Testing**
- [ ] Review all metrics
- [ ] Analyze error logs
- [ ] Generate performance report
- [ ] Document findings
- [ ] Plan optimizations if needed

## 📊 **Sample Test Results**

### **Light Load Test Example**
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

## 🎯 **Next Steps**

### **Immediate Actions**
1. **Start your poker server**: `cd pokerv2/server && npm start`
2. **Run a light test**: `./quick-test.sh light`
3. **Monitor performance**: `./quick-test.sh monitor`
4. **Review results** and optimize if needed

### **Regular Testing**
- Run light tests during development
- Run medium tests before deployments
- Run heavy tests for production validation
- Run stress tests to find breaking points

### **Performance Monitoring**
- Set up continuous monitoring
- Track performance trends over time
- Set up alerts for performance degradation
- Regular capacity planning

## 📞 **Support**

For issues or questions about load testing:
- **Email**: support@example.com
- **Telegram**: @poker_support
- **Website**: https://github.com/Ncit/phaserv2

## 🎉 **Ready to Test!**

Your server load testing system is now complete and ready to use. Start with a light test to verify everything is working, then gradually increase the load to understand your server's performance characteristics.

**Happy testing! 🚀** 