# 🚀 GitHub Pages Deployment Guide

This guide explains how to deploy the poker game client to GitHub Pages using the provided deployment scripts.

## 📋 **Overview**

GitHub Pages allows you to host static websites directly from your GitHub repository. The deployment scripts automatically copy files from the `client/` directory to a `gh-pages` branch, which GitHub then serves as a static website.

## 🛠️ **Prerequisites**

### **Required Tools**
- **Git**: Version control system
- **GitHub Account**: To host the repository
- **Repository**: Your project must be in a GitHub repository

### **Repository Setup**
1. **Remote Origin**: Ensure your repository has a remote origin pointing to GitHub
   ```bash
   git remote -v
   # Should show something like:
   # origin  https://github.com/username/repository.git (fetch)
   # origin  https://github.com/username/repository.git (push)
   ```

2. **GitHub Pages Enabled**: Enable GitHub Pages in your repository settings
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

## 📁 **Deployment Scripts**

### **Available Scripts**

#### **1. Simple Deployment Script** (Recommended)
```bash
./scripts/deploy-to-gh-pages-simple.sh
```
- **Purpose**: Simple, reliable deployment
- **Features**: Basic deployment with error handling
- **Best for**: Most use cases

#### **2. Advanced Deployment Script**
```bash
./scripts/deploy-to-gh-pages.sh
```
- **Purpose**: Advanced deployment with additional features
- **Features**: Temporary directory handling, more complex error handling
- **Best for**: Advanced users who need more control

## 🚀 **Quick Start**

### **Basic Deployment**
```bash
# Navigate to project root
cd pokerv2

# Run deployment script
./scripts/deploy-to-gh-pages-simple.sh
```

### **Deployment with Custom Message**
```bash
./scripts/deploy-to-gh-pages-simple.sh -m "Update game UI and fix bugs"
```

### **Force Deployment** (with uncommitted changes)
```bash
./scripts/deploy-to-gh-pages-simple.sh --force
```

## 📖 **Detailed Usage**

### **Command Line Options**

#### **Simple Script Options**
```bash
./scripts/deploy-to-gh-pages-simple.sh [OPTIONS]

Options:
  -m, --message MESSAGE    Custom commit message (default: 'Deploy to GitHub Pages')
  -f, --force              Force deployment even with uncommitted changes
  -h, --help               Show this help message
```

#### **Advanced Script Options**
```bash
./scripts/deploy-to-gh-pages.sh [OPTIONS]

Options:
  -m, --message MESSAGE    Custom commit message (default: 'Deploy to GitHub Pages')
  -f, --force              Force deployment even with uncommitted changes
  -h, --help               Show this help message
```

### **Examples**

#### **Standard Deployment**
```bash
./scripts/deploy-to-gh-pages-simple.sh
```
- Uses default commit message
- Checks for uncommitted changes
- Prompts for confirmation if changes exist

#### **Custom Commit Message**
```bash
./scripts/deploy-to-gh-pages-simple.sh -m "Add new poker features and improve UI"
```

#### **Force Deployment**
```bash
./scripts/deploy-to-gh-pages-simple.sh --force
```
- Skips uncommitted changes check
- Proceeds without confirmation

#### **Help Information**
```bash
./scripts/deploy-to-gh-pages-simple.sh --help
```

## 🔄 **Deployment Process**

### **What the Script Does**

1. **Prerequisites Check**
   - Verifies git is installed
   - Checks if in a git repository
   - Confirms client directory exists
   - Validates remote origin is configured

2. **Git Status Check**
   - Checks for uncommitted changes
   - Prompts for confirmation if changes exist (unless --force)

3. **gh-pages Branch Setup**
   - Creates gh-pages branch if it doesn't exist
   - Checks out existing gh-pages branch if it exists
   - Pulls latest changes from remote

4. **File Deployment**
   - Removes all existing files from gh-pages branch
   - Copies all files from `client/` directory
   - Removes unwanted files (.DS_Store, .git*)
   - Commits changes with specified message
   - Pushes to remote repository

5. **Branch Restoration**
   - Switches back to original branch
   - Provides deployment URL

### **File Structure After Deployment**

```
gh-pages branch (deployed):
├── index.html              # Main entry point
├── src/                    # Game source code
├── assets/                 # Game assets
├── dependencies/           # External libraries
├── scripts/                # Client scripts
└── ...                     # Other client files
```

## 🌐 **Accessing Your Deployed Application**

### **Default URL Format**
```
https://username.github.io/repository-name
```

### **Example URLs**
- **Repository**: `https://github.com/username/pokerv2`
- **Deployed Site**: `https://username.github.io/pokerv2`

### **Custom Domain** (Optional)
You can set up a custom domain in your repository settings:
1. Go to repository Settings → Pages
2. Add your custom domain
3. Update DNS settings accordingly

## ⚠️ **Important Notes**

### **GitHub Pages Limitations**
- **Static Content Only**: No server-side processing
- **File Size Limits**: Large assets may cause issues
- **Build Time**: Changes may take a few minutes to appear
- **HTTPS Only**: All GitHub Pages sites use HTTPS

### **Client-Side Considerations**
- **Environment Configuration**: Ensure client is configured for production
- **Asset Paths**: All paths must be relative
- **External Dependencies**: Must be accessible via CDN or included locally

### **Security Considerations**
- **Public Access**: GitHub Pages sites are publicly accessible
- **No Authentication**: No built-in authentication
- **API Keys**: Don't expose sensitive API keys in client code

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. "Not in a git repository"**
```bash
# Ensure you're in the project root
cd pokerv2
pwd  # Should show path ending with pokerv2
```

#### **2. "No remote origin configured"**
```bash
# Add remote origin
git remote add origin https://github.com/username/repository.git
```

#### **3. "Client directory not found"**
```bash
# Ensure client directory exists
ls -la client/
```

#### **4. "Permission denied"**
```bash
# Make script executable
chmod +x scripts/deploy-to-gh-pages-simple.sh
```

#### **5. "Branch already exists"**
- The script handles this automatically
- It will checkout and update the existing branch

### **Manual Deployment** (if scripts fail)

If the deployment scripts fail, you can deploy manually:

```bash
# 1. Create gh-pages branch
git checkout --orphan gh-pages

# 2. Remove all files
git rm -rf .

# 3. Copy client files
cp -r client/* .

# 4. Add and commit
git add .
git commit -m "Manual deployment"

# 5. Push to remote
git push origin gh-pages

# 6. Return to original branch
git checkout main
```

## 📊 **Monitoring Deployment**

### **Check Deployment Status**
1. **GitHub Actions**: If using GitHub Actions for deployment
2. **Repository Settings**: Settings → Pages shows deployment status
3. **Site URL**: Visit your site URL to verify deployment

### **Deployment Logs**
- **Script Output**: The deployment script provides detailed output
- **Git Logs**: Check git history for deployment commits
- **GitHub Pages Logs**: Available in repository settings

## 🔄 **Automation Options**

### **GitHub Actions** (Recommended)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to GitHub Pages
      run: |
        chmod +x scripts/deploy-to-gh-pages-simple.sh
        ./scripts/deploy-to-gh-pages-simple.sh -m "Auto-deploy from GitHub Actions"
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### **Pre-commit Hooks**
Add to `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Auto-deploy on commit to main branch
if [[ $(git rev-parse --abbrev-ref HEAD) == "main" ]]; then
    echo "Auto-deploying to GitHub Pages..."
    ./scripts/deploy-to-gh-pages-simple.sh -m "Auto-deploy from pre-commit hook"
fi
```

## 📚 **Related Documentation**

- **[Client README](../client/README.md)**: Client application setup
- **[Environment Configuration](../features/ui/ENVIRONMENT_SCRIPTS_README.md)**: Environment management
- **[Asset Management](../project/ASSET_FIX_SUMMARY.md)**: Asset organization

## 🆘 **Support**

If you encounter issues:

1. **Check Prerequisites**: Ensure all requirements are met
2. **Review Script Output**: Look for specific error messages
3. **Verify Repository Setup**: Check GitHub repository configuration
4. **Manual Deployment**: Try manual deployment steps
5. **GitHub Support**: Check GitHub Pages documentation

---

**🚀 Your poker game is now ready for deployment to GitHub Pages!** 