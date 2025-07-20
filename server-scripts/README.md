# Server Scripts Directory

This directory contains all server-related scripts and utilities for the poker game multiplayer server. These scripts handle server startup, testing, and debugging for the multiplayer functionality.

## 🚀 **Quick Start**

```bash
# Start multiplayer server
./server-scripts/start-multiplayer.sh

# Test server functionality
node server-scripts/test-server.js

# Test WebSocket connections
node server-scripts/test-websocket.js
```

## 📋 **Script Categories**

### 🚀 **Server Management**
Scripts for starting and managing the multiplayer server.

#### `start-multiplayer.sh`
**Purpose**: Start the multiplayer game server
**Usage**: `./server-scripts/start-multiplayer.sh`
**Features**:
- Starts Node.js server for multiplayer functionality
- Handles server dependencies and setup
- Provides server status information
- Background server execution
- Automatic port management

### 🧪 **Server Testing**
Scripts for testing server functionality and connections.

#### `test-server.js`
**Purpose**: Test basic server functionality
**Usage**: `node server-scripts/test-server.js`
**Features**:
- Tests server startup and shutdown
- Validates server configuration
- Tests basic HTTP endpoints
- Server health checks
- Connection testing

#### `test-websocket.js`
**Purpose**: Test WebSocket connections and real-time communication
**Usage**: `node server-scripts/test-websocket.js`
**Features**:
- WebSocket connection testing
- Real-time message testing
- Connection stability tests
- Multi-client simulation
- Performance testing

#### `test-allin-setup.js`
**Purpose**: Test all-in game scenarios and server handling
**Usage**: `node server-scripts/test-allin-setup.js`
**Features**:
- All-in game scenario testing
- Server game state management
- Player betting simulation
- Game flow validation
- Edge case testing

## 🎯 **Script Functions**

### Server Startup
```bash
# Start multiplayer server
./server-scripts/start-multiplayer.sh

# Check server status
ps aux | grep node

# Stop server
pkill -f "node.*server.js"
```

### Server Testing
```bash
# Test basic server functionality
node server-scripts/test-server.js

# Test WebSocket connections
node server-scripts/test-websocket.js

# Test all-in scenarios
node server-scripts/test-allin-setup.js
```

### Server Debugging
```bash
# Check server logs
tail -f server/logs/server.log

# Monitor server processes
htop

# Check server ports
netstat -tulpn | grep :3000
```

## 🔧 **Server Configuration**

### Environment Variables
The server scripts use these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `NODE_ENV` | `development` | Node.js environment |
| `DEBUG` | `false` | Debug logging |

### Server Dependencies
```bash
# Install server dependencies
cd server && npm install

# Check server dependencies
cd server && npm list

# Update server dependencies
cd server && npm update
```

## 📁 **File Structure**

```
server-scripts/
├── README.md                    # This documentation
├── start-multiplayer.sh         # Server startup script
├── test-server.js               # Basic server testing
├── test-websocket.js            # WebSocket testing
└── test-allin-setup.js          # All-in scenario testing
```

## 🚀 **Usage Examples**

### Development Server Setup
```bash
# 1. Install server dependencies
cd server && npm install

# 2. Start development server
./server-scripts/start-multiplayer.sh

# 3. Test server functionality
node server-scripts/test-server.js

# 4. Test WebSocket connections
node server-scripts/test-websocket.js
```

### Production Server Setup
```bash
# 1. Set production environment
NODE_ENV=production

# 2. Start production server
./server-scripts/start-multiplayer.sh

# 3. Monitor server health
node server-scripts/test-server.js
```

### Testing Scenarios
```bash
# Test basic functionality
node server-scripts/test-server.js

# Test real-time communication
node server-scripts/test-websocket.js

# Test game scenarios
node server-scripts/test-allin-setup.js
```

## 🔍 **Troubleshooting**

### Common Issues

#### Server Won't Start
```bash
# Check Node.js installation
node --version

# Check server dependencies
cd server && npm install

# Check port availability
lsof -i :3000

# Start server with debug
DEBUG=true ./server-scripts/start-multiplayer.sh
```

#### WebSocket Connection Issues
```bash
# Test WebSocket connectivity
node server-scripts/test-websocket.js

# Check firewall settings
sudo ufw status

# Test with different port
PORT=3001 ./server-scripts/start-multiplayer.sh
```

#### Game Logic Issues
```bash
# Test all-in scenarios
node server-scripts/test-allin-setup.js

# Check server logs
tail -f server/logs/server.log

# Restart server
pkill -f "node.*server.js" && ./server-scripts/start-multiplayer.sh
```

### Debug Commands
```bash
# Check server processes
ps aux | grep node

# Monitor server logs
tail -f server/logs/*.log

# Test server endpoints
curl http://localhost:3000/health

# Check server configuration
cat server/config/server.js
```

## 📝 **Creating New Server Scripts**

When adding new server scripts:

1. **Use descriptive names**: `[action]-[target].js` or `[action]-[target].sh`
2. **Add shebang for shell scripts**: `#!/bin/bash`
3. **Include help text**: Add usage information
4. **Make executable**: `chmod +x server-scripts/new-script.sh`
5. **Update this README**: Document the new script
6. **Test thoroughly**: Verify functionality

### Script Template
```bash
#!/bin/bash

# Script Name: [Name]
# Purpose: [Description]
# Usage: ./server-scripts/[script-name].sh

echo "Server script description"
echo "========================"

# Script logic here

echo "✅ Server script completed successfully"
```

### Node.js Script Template
```javascript
#!/usr/bin/env node

/**
 * Script Name: [Name]
 * Purpose: [Description]
 * Usage: node server-scripts/[script-name].js
 */

console.log('Server script description');
console.log('========================');

// Script logic here

console.log('✅ Server script completed successfully');
```

## 🔗 **Related Files**

- `server/` - Multiplayer server files
- `server/package.json` - Server dependencies
- `server/server.js` - Main server file
- `server/config/` - Server configuration
- `server/logs/` - Server log files

## 📊 **Script Statistics**

- **Total Scripts**: 4 server-related scripts
- **Shell Scripts**: 1 startup script
- **Node.js Scripts**: 3 testing scripts
- **Server Management**: 1 script
- **Testing Scripts**: 3 scripts

## 🎯 **Best Practices**

1. **Always check dependencies** before running scripts
2. **Use descriptive script names** for clarity
3. **Test scripts** after server changes
4. **Keep scripts focused** on single responsibilities
5. **Document changes** in this README
6. **Use consistent naming** conventions
7. **Handle errors gracefully** in scripts
8. **Provide clear feedback** to users

## 🚀 **Quick Reference**

| Action | Command |
|--------|---------|
| Start Server | `./server-scripts/start-multiplayer.sh` |
| Test Server | `node server-scripts/test-server.js` |
| Test WebSocket | `node server-scripts/test-websocket.js` |
| Test All-in | `node server-scripts/test-allin-setup.js` |
| Check Status | `ps aux | grep node` |
| View Logs | `tail -f server/logs/server.log` |

## 🔧 **Server Integration**

### With Main Project Scripts
```bash
# From project root, start server
./server-scripts/start-multiplayer.sh

# From project root, test server
node server-scripts/test-server.js
```

### With Environment Scripts
```bash
# Set environment and start server
./scripts/set-development.sh
./server-scripts/start-multiplayer.sh

# Set production and start server
./scripts/set-production.sh
./server-scripts/start-multiplayer.sh
```

### With Test Scripts
```bash
# Run tests with server
./scripts/run-tests.sh
./server-scripts/start-multiplayer.sh
```

## 📚 **Server Documentation**

For detailed server documentation, see:
- **[Server README](../server/README.md)** - Server setup and configuration
- **[Multiplayer Guide](../docs/MULTIPLAYER_README.md)** - Multiplayer functionality
- **[Server Configuration](../server/config/)** - Server configuration files 