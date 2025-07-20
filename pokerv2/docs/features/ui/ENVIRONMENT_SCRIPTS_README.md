# Environment Toggle Scripts

This directory contains scripts to easily switch between development and production VK environments.

## Scripts Overview

### 🛠️ `set-development.sh`
**Purpose**: Explicitly sets environment to development mode
**Usage**: `./scripts/set-development.sh`

### 🚀 `set-vk.sh`
**Purpose**: Explicitly sets environment to production VK mode
**Usage**: `./scripts/set-vk.sh`

### 🔄 `toggle-environment.sh`
**Purpose**: Toggles between development and productionVK environments
**Usage**: `./scripts/toggle-environment.sh`

### 🔍 `check-environment.sh`
**Purpose**: Shows current environment status without making changes
**Usage**: `./scripts/check-environment.sh`

## Quick Start

### Option 1: Explicit Environment Setting
1. **Check current environment:**
   ```bash
   ./scripts/check-environment.sh
   ```

2. **Set to development mode:**
   ```bash
   ./scripts/set-development.sh
   ```

3. **Set to production VK mode:**
   ```bash
   ./scripts/set-vk.sh
   ```

### Option 2: Toggle Between Environments
1. **Check current environment:**
   ```bash
   ./scripts/check-environment.sh
   ```

2. **Toggle environment:**
   ```bash
   ./scripts/toggle-environment.sh
   ```

3. **Toggle back:**
   ```bash
   ./scripts/toggle-environment.sh
   ```

## Environment Modes

### 🛠️ Development Mode
- **Debug**: Enabled
- **Player Selection**: Enabled (debug player selection screen)
- **Mock Data**: Enabled (uses mock VK user data)
- **Ngrok Headers**: Enabled
- **Verbose Errors**: Enabled

### 🚀 Production VK Mode
- **Debug**: Disabled
- **Player Selection**: Disabled (goes directly to game)
- **Mock Data**: Disabled (uses real VK Bridge)
- **Ngrok Headers**: Enabled
- **Verbose Errors**: Disabled

## What the Scripts Do

### Development Script
1. **Checks** current environment setting
2. **Switches** to development mode if not already set
3. **Verifies** the change was successful
4. **Shows** development environment features

### Production Script
1. **Checks** current environment setting
2. **Switches** to production VK mode if not already set
3. **Verifies** the change was successful
4. **Shows** production environment features

### Toggle Script
1. **Detects** current environment by reading `client/src/config/EnvironmentConfig.js`
2. **Switches** the `detectEnvironment()` function return value
3. **Verifies** the change was successful
4. **Shows** summary of new environment features

### Status Script
1. **Reads** current environment setting
2. **Displays** current features and capabilities
3. **Shows** file modification time
4. **Provides** helpful usage tips

## File Changes

The scripts modify this line in `client/src/config/EnvironmentConfig.js`:

```javascript
// In detectEnvironment() function
return 'development';     // ← This line gets changed
// or
return 'productionVK';    // ← To this
```

## Testing Changes

After running the toggle script:

1. **Refresh your browser** to see the changes
2. **Or restart your development server** if needed
3. **Check the console** for environment detection logs
4. **Run environment tests**:
   ```bash
   # Start server
   python3 -m http.server 8000
   
   # Test environment configuration
   open http://localhost:8000/tests/test-environment-config.html
   
   # Quick test
   open http://localhost:8000/tests/simple-test.html
   ```

## Use Cases

### Development Workflow
```bash
# Start in development mode
./scripts/set-development.sh

# Work on features with debug enabled
# ... development work ...

# Switch to production mode for testing
./scripts/set-vk.sh

# Test production behavior
# ... testing ...

# Switch back to development
./scripts/set-development.sh
```

### Production Deployment
```bash
# Ensure production mode before deployment
./scripts/set-vk.sh

# Verify production settings
./scripts/check-environment.sh

# Deploy to production
# ... deployment process ...
```

## Troubleshooting

### Script Not Found
```bash
# Make sure scripts are executable
chmod +x scripts/toggle-environment.sh
chmod +x scripts/check-environment.sh
```

### File Not Found
```bash
# Make sure you're in the pokerv2 directory
pwd
# Should show: /path/to/phaserv2/pokerv2
```

### Environment Not Detected
```bash
# Check if the file has the expected format
grep -n "return.*development\|return.*productionVK" client/src/config/EnvironmentConfig.js
```

## Integration with Git

### Pre-commit Hook (Optional)
You can add this to your git hooks to ensure production mode before commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit
if grep -q "return 'development';" pokerv2/client/src/config/EnvironmentConfig.js; then
    echo "⚠️  Warning: Environment is set to development mode"
    echo "💡 Consider switching to production mode before committing"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
```

### Git Aliases (Optional)
Add these to your `.gitconfig`:

```ini
[alias]
    env-dev = "!cd pokerv2 && ./set-development.sh && git add client/src/config/EnvironmentConfig.js"
    env-prod = "!cd pokerv2 && ./set-vk.sh && git add client/src/config/EnvironmentConfig.js"
    env-status = "!cd pokerv2 && ./check-environment.sh"
```

## Safety Features

- **Verification**: Scripts verify changes were successful
- **Error Handling**: Clear error messages if something goes wrong
- **No Data Loss**: Only modifies the environment detection line
- **Reversible**: Can always toggle back to previous state

## Related Files

- `client/src/config/EnvironmentConfig.js` - Main configuration file
- `ENVIRONMENT_MIGRATION_GUIDE.md` - Detailed migration guide
- `restore-dev-mode.sh` - Legacy development mode script 