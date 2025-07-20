# Environment Toggle Scripts

This directory contains scripts to easily switch between development and production VK environments.

## Scripts Overview

### 🔄 `toggle-environment.sh`
**Purpose**: Toggles between development and productionVK environments
**Usage**: `./toggle-environment.sh`

### 🔍 `check-environment.sh`
**Purpose**: Shows current environment status without making changes
**Usage**: `./check-environment.sh`

## Quick Start

1. **Check current environment:**
   ```bash
   ./check-environment.sh
   ```

2. **Toggle environment:**
   ```bash
   ./toggle-environment.sh
   ```

3. **Toggle back:**
   ```bash
   ./toggle-environment.sh
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

### Toggle Script
1. **Detects** current environment by reading `src/config/EnvironmentConfig.js`
2. **Switches** the `detectEnvironment()` function return value
3. **Verifies** the change was successful
4. **Shows** summary of new environment features

### Status Script
1. **Reads** current environment setting
2. **Displays** current features and capabilities
3. **Shows** file modification time
4. **Provides** helpful usage tips

## File Changes

The scripts modify this line in `src/config/EnvironmentConfig.js`:

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

## Use Cases

### Development Workflow
```bash
# Start in development mode
./check-environment.sh

# Work on features with debug enabled
# ... development work ...

# Switch to production mode for testing
./toggle-environment.sh

# Test production behavior
# ... testing ...

# Switch back to development
./toggle-environment.sh
```

### Production Deployment
```bash
# Ensure production mode before deployment
./toggle-environment.sh

# Verify production settings
./check-environment.sh

# Deploy to production
# ... deployment process ...
```

## Troubleshooting

### Script Not Found
```bash
# Make sure scripts are executable
chmod +x toggle-environment.sh
chmod +x check-environment.sh
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
grep -n "return.*development\|return.*productionVK" src/config/EnvironmentConfig.js
```

## Integration with Git

### Pre-commit Hook (Optional)
You can add this to your git hooks to ensure production mode before commits:

```bash
#!/bin/bash
# .git/hooks/pre-commit
if grep -q "return 'development';" pokerv2/src/config/EnvironmentConfig.js; then
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
    env-dev = "!cd pokerv2 && ./toggle-environment.sh && git add src/config/EnvironmentConfig.js"
    env-prod = "!cd pokerv2 && ./toggle-environment.sh && git add src/config/EnvironmentConfig.js"
    env-status = "!cd pokerv2 && ./check-environment.sh"
```

## Safety Features

- **Verification**: Scripts verify changes were successful
- **Error Handling**: Clear error messages if something goes wrong
- **No Data Loss**: Only modifies the environment detection line
- **Reversible**: Can always toggle back to previous state

## Related Files

- `src/config/EnvironmentConfig.js` - Main configuration file
- `ENVIRONMENT_MIGRATION_GUIDE.md` - Detailed migration guide
- `restore-dev-mode.sh` - Legacy development mode script 