# Server Dependency Update Guide

## 🎯 **Overview**

This guide provides comprehensive instructions for updating Node.js dependencies in the Poker Game v2 server.

## 🚀 **Quick Start**

### **Interactive Update Tool (Recommended)**
```bash
# Navigate to server directory
cd server

# Run interactive update tool
./scripts/update-dependencies.sh
```

### **Quick Commands**
```bash
# Check current status
./scripts/update-dependencies.sh status

# Safe update (within version ranges)
./scripts/update-dependencies.sh safe

# Update to latest versions
./scripts/update-dependencies.sh latest

# Clean install (fresh start)
./scripts/update-dependencies.sh clean

# Fix security issues
./scripts/update-dependencies.sh security

# All-in-one update
./scripts/update-dependencies.sh all
```

## 📋 **Update Methods**

### **1. Safe Update (Recommended for Production)**
Updates packages within their specified version ranges in `package.json`.

```bash
npm update
```

**Benefits:**
- ✅ Safe and predictable
- ✅ Maintains compatibility
- ✅ No breaking changes
- ✅ Quick and reliable

### **2. Latest Versions Update**
Updates packages to their latest versions, potentially including breaking changes.

```bash
# Install npm-check-updates globally
npm install -g npm-check-updates

# Check available updates
npx npm-check-updates

# Update package.json to latest versions
npx npm-check-updates -u

# Install updated packages
npm install
```

**Benefits:**
- ✅ Latest features and bug fixes
- ✅ Security updates
- ✅ Performance improvements

**Risks:**
- ⚠️ Potential breaking changes
- ⚠️ May require code updates
- ⚠️ Testing required

### **3. Clean Install**
Removes all dependencies and reinstalls them fresh.

```bash
# Remove existing modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

**Benefits:**
- ✅ Resolves dependency conflicts
- ✅ Fresh installation
- ✅ Clears cached issues

### **4. Security Updates**
Checks and fixes security vulnerabilities.

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

## 🔧 **Current Dependencies**

### **Production Dependencies**
```json
{
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "socket.io": "^4.7.2",
  "socket.io-client": "^4.8.1",
  "uuid": "^9.0.0"
}
```

### **Development Dependencies**
```json
{
  "jest": "^29.7.0",
  "nodemon": "^3.0.1"
}
```

## 📊 **Update Status**

### **Current Status Check**
```bash
npm outdated
```

**Output Example:**
```
Package           Current  Wanted  Latest  Location
dotenv            MISSING  16.6.1  17.2.0  -
express             5.1.0  4.21.2   5.1.0  node_modules/express
socket.io-client  MISSING   4.8.1   4.8.1  -
uuid              MISSING   9.0.1  11.1.0  -
```

### **Security Audit**
```bash
npm audit
```

## 🎯 **Update Strategies**

### **Development Environment**
- **Frequency**: Weekly or bi-weekly
- **Method**: Latest versions update
- **Testing**: Run full test suite after updates

### **Staging Environment**
- **Frequency**: Before each release
- **Method**: Safe update first, then latest versions
- **Testing**: Comprehensive testing required

### **Production Environment**
- **Frequency**: Monthly or quarterly
- **Method**: Safe update only
- **Testing**: Extensive testing and gradual rollout

## 🧪 **Testing After Updates**

### **1. Basic Functionality**
```bash
# Start server
npm start

# Test basic connectivity
curl http://localhost:3000
```

### **2. WebSocket Testing**
```bash
# Run WebSocket tests
cd scripts
node test-websocket.js
```

### **3. Game Logic Testing**
```bash
# Run game tests
cd scripts
node test-server.js
node test-allin-setup.js
```

### **4. Integration Testing**
```bash
# Test with client
cd ../client
python3 -m http.server 8000
# Open browser and test game functionality
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Version Conflicts**
```bash
# Check for conflicts
npm ls

# Resolve conflicts
npm dedupe
```

#### **Security Vulnerabilities**
```bash
# Check vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Manual fix for specific packages
npm install package-name@version
```

#### **Broken Dependencies**
```bash
# Clear npm cache
npm cache clean --force

# Clean install
rm -rf node_modules package-lock.json
npm install
```

#### **Permission Issues**
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config
```

## 📈 **Best Practices**

### **1. Regular Updates**
- Update dependencies regularly (weekly/monthly)
- Monitor for security vulnerabilities
- Keep track of breaking changes

### **2. Testing Strategy**
- Always test after updates
- Use staging environment for testing
- Gradual rollout in production

### **3. Version Management**
- Use semantic versioning
- Lock versions for production
- Document breaking changes

### **4. Security**
- Regular security audits
- Update vulnerable packages immediately
- Monitor security advisories

## 🔄 **Automated Updates**

### **GitHub Actions (Optional)**
```yaml
name: Update Dependencies
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  update-deps:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: |
          cd server
          npm update
          npm audit fix
```

## 📚 **Additional Resources**

- **[npm Documentation](https://docs.npmjs.com/)**
- **[npm-check-updates](https://github.com/raineorshine/npm-check-updates)**
- **[npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)**
- **[Semantic Versioning](https://semver.org/)**

---

*This guide ensures safe and effective dependency management for the Poker Game v2 server.* 