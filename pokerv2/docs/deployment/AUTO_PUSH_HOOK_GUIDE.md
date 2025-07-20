# 🔄 Auto-Push Hook Guide

This guide explains how to set up and use the automatic push hook for the gh-pages branch, which automatically deploys your poker game to GitHub Pages after every commit.

## 🎯 **Overview**

The auto-push hook automatically pushes the `gh-pages` branch to the remote repository after every commit to that branch. This eliminates the need to manually run `git push` after deploying your application.

## 🚀 **Quick Start**

### **Install the Auto-Push Hook**
```bash
# Navigate to project root
cd /Users/nikitaf/development/sources/phaserv2

# Install the auto-push hook
./pokerv2/scripts/setup-auto-push-hook.sh --install
```

### **Check Hook Status**
```bash
./pokerv2/scripts/setup-auto-push-hook.sh --status
```

### **Remove the Hook** (if needed)
```bash
./pokerv2/scripts/setup-auto-push-hook.sh --remove
```

## 📋 **How It Works**

### **Hook Trigger**
- The hook is triggered automatically after every commit
- It only runs when you're on the `gh-pages` branch
- It checks if auto-push is enabled before proceeding

### **Auto-Push Process**
1. **Commit Detection**: Detects commits on gh-pages branch
2. **Push Check**: Checks if there are commits ahead of remote
3. **Automatic Push**: Pushes commits to remote repository
4. **Deployment URL**: Shows the deployment URL after successful push

### **Safety Features**
- **Branch-Specific**: Only runs on gh-pages branch
- **Enable/Disable**: Can be easily enabled or disabled
- **Error Handling**: Provides clear error messages
- **Non-Destructive**: Safe to install and remove

## 🔧 **Installation**

### **Prerequisites**
- Git repository with remote origin configured
- gh-pages branch exists (locally and remotely)
- Proper permissions to create Git hooks

### **Installation Steps**
```bash
# 1. Navigate to project root
cd /Users/nikitaf/development/sources/phaserv2

# 2. Install the auto-push hook
./pokerv2/scripts/setup-auto-push-hook.sh --install

# 3. Verify installation
./pokerv2/scripts/setup-auto-push-hook.sh --status
```

### **What Gets Installed**
- **Post-commit Hook**: `.git/hooks/post-commit`
- **Enable File**: `.git/auto-push-enabled`
- **Executable Permissions**: Hook is made executable

## 📊 **Status Check**

### **Check Hook Status**
```bash
./pokerv2/scripts/setup-auto-push-hook.sh --status
```

### **Status Indicators**
- ✅ **Post-commit hook file exists**
- ✅ **Auto-push hook is installed**
- ✅ **Hook is executable**
- ✅ **Auto-push is enabled**
- ✅ **gh-pages branch exists locally**
- ✅ **gh-pages branch exists remotely**

### **Example Status Output**
```
==========================================
📊 AUTO-PUSH HOOK STATUS
==========================================
✅ Post-commit hook file exists
✅ Auto-push hook is installed
✅ Hook is executable
✅ Auto-push is enabled
✅ gh-pages branch exists locally
✅ gh-pages branch exists remotely
==========================================
```

## 🧪 **Testing the Hook**

### **Test on gh-pages Branch**
```bash
# 1. Switch to gh-pages branch
git checkout gh-pages

# 2. Make a test commit
echo "# Test commit" >> test-file.md
git add test-file.md
git commit -m "Test auto-push hook"

# 3. The hook should automatically push and show:
# [AUTO-PUSH] Auto-push hook triggered for gh-pages branch
# [AUTO-PUSH] Pushing 1 commit(s) to remote...
# [AUTO-PUSH] ✅ Successfully pushed to remote
```

### **Expected Output**
```
[AUTO-PUSH] Auto-push hook triggered for gh-pages branch
[AUTO-PUSH] Pushing 1 commit(s) to remote...
[AUTO-PUSH] ✅ Successfully pushed to remote

==========================================
🚀 AUTO-DEPLOYMENT SUCCESSFUL!
==========================================
Your application is now available at:
   🌐 https://ncit.github.io/phaserv2

Note: It may take a few minutes for changes to appear.
==========================================
```

## 🔄 **Workflow Integration**

### **Complete Deployment Workflow**
```bash
# 1. Deploy to gh-pages branch
./pokerv2/scripts/deploy-to-gh-pages-simple.sh -m "Update game features"

# 2. The auto-push hook automatically pushes to remote
# 3. GitHub Pages automatically deploys the changes
# 4. Your game is live at https://ncit.github.io/phaserv2
```

### **Manual Commits on gh-pages**
```bash
# 1. Switch to gh-pages branch
git checkout gh-pages

# 2. Make changes and commit
git add .
git commit -m "Update game assets"

# 3. Auto-push hook automatically pushes to remote
# 4. Changes are deployed to GitHub Pages
```

## ⚙️ **Configuration**

### **Hook Configuration**
The hook uses these default settings:
- **Target Branch**: `gh-pages`
- **Hook File**: `.git/hooks/post-commit`
- **Enable File**: `.git/auto-push-enabled`

### **Customization**
You can modify the hook by editing `.git/hooks/post-commit`:
```bash
# Edit the hook file
nano .git/hooks/post-commit

# Or view the hook content
cat .git/hooks/post-commit
```

## 🛠️ **Troubleshooting**

### **Common Issues**

#### **1. Hook Not Triggering**
```bash
# Check if hook is executable
ls -la .git/hooks/post-commit

# Make hook executable if needed
chmod +x .git/hooks/post-commit
```

#### **2. Auto-Push Disabled**
```bash
# Re-enable auto-push
./pokerv2/scripts/setup-auto-push-hook.sh --install
```

#### **3. Not on gh-pages Branch**
```bash
# Switch to gh-pages branch
git checkout gh-pages

# Make a commit to test the hook
echo "# Test" >> test.md
git add test.md
git commit -m "Test"
```

#### **4. Push Fails**
```bash
# Check remote configuration
git remote -v

# Check branch status
git status

# Manual push to debug
git push origin gh-pages
```

### **Debug Mode**
To debug the hook, you can temporarily modify it to add more logging:
```bash
# Edit the hook file
nano .git/hooks/post-commit

# Add debug statements
echo "Debug: Current branch is $CURRENT_BRANCH" >> /tmp/hook-debug.log
```

## 🔒 **Security Considerations**

### **Hook Safety**
- **Non-Destructive**: The hook only pushes, never deletes
- **Branch-Specific**: Only runs on gh-pages branch
- **Enable/Disable**: Can be easily disabled if needed
- **Error Handling**: Fails safely if push fails

### **Repository Security**
- **Read-Only**: Hook only pushes, doesn't modify source code
- **Isolated**: Hook only affects gh-pages branch
- **Reversible**: Can be completely removed if needed

## 📚 **Integration with Other Tools**

### **GitHub Actions**
The auto-push hook works alongside GitHub Actions:
- **Local Development**: Use auto-push hook for quick deployments
- **CI/CD Pipeline**: Use GitHub Actions for automated testing and deployment
- **Hybrid Approach**: Combine both for comprehensive deployment strategy

### **Pre-commit Hooks**
The auto-push hook doesn't interfere with other hooks:
- **Pre-commit**: Runs before commit (linting, testing)
- **Post-commit**: Runs after commit (auto-push)
- **Pre-push**: Runs before push (additional checks)

## 🎯 **Best Practices**

### **Recommended Workflow**
1. **Development**: Work on main/development branch
2. **Deployment**: Use deployment script to update gh-pages
3. **Auto-Push**: Let hook handle remote pushing
4. **Verification**: Check GitHub Pages deployment status

### **Hook Management**
- **Regular Status Checks**: Periodically check hook status
- **Backup**: Keep a backup of the hook file
- **Documentation**: Document any customizations
- **Testing**: Test hook after repository changes

### **Error Handling**
- **Monitor Output**: Watch for error messages
- **Manual Fallback**: Use manual push if hook fails
- **Logging**: Check logs for debugging information
- **Recovery**: Know how to reinstall the hook

## 📊 **Performance Impact**

### **Hook Performance**
- **Minimal Overhead**: Hook runs quickly
- **Conditional Execution**: Only runs on gh-pages branch
- **Efficient Checks**: Minimal git operations
- **Non-Blocking**: Doesn't slow down other operations

### **Network Impact**
- **Small Transfers**: Only pushes new commits
- **Incremental**: Doesn't re-upload unchanged files
- **Compressed**: Uses git's compression
- **Efficient**: Leverages git's delta compression

## 🔮 **Future Enhancements**

### **Potential Improvements**
- **Configurable Branches**: Support for multiple deployment branches
- **Selective Pushing**: Push only specific file types
- **Deployment Notifications**: Send notifications on successful deployment
- **Rollback Support**: Automatic rollback on deployment failure
- **Health Checks**: Verify deployment after push

### **Advanced Features**
- **Deployment Logging**: Log all deployment activities
- **Performance Metrics**: Track deployment times
- **Error Reporting**: Send error reports on failures
- **Integration APIs**: Connect with external deployment services

## 📚 **Related Documentation**

- **[GitHub Pages Deployment Guide](GITHUB_PAGES_DEPLOYMENT.md)**: Complete deployment documentation
- **[Deployment Scripts](../scripts/)**: All deployment-related scripts
- **[Git Hooks Documentation](https://git-scm.com/docs/githooks)**: Official Git hooks documentation

## 🆘 **Support**

### **Getting Help**
1. **Check Status**: Run `./pokerv2/scripts/setup-auto-push-hook.sh --status`
2. **Review Logs**: Check for error messages in hook output
3. **Manual Test**: Try manual push to isolate issues
4. **Reinstall**: Remove and reinstall the hook if needed

### **Common Commands**
```bash
# Check hook status
./pokerv2/scripts/setup-auto-push-hook.sh --status

# Reinstall hook
./pokerv2/scripts/setup-auto-push-hook.sh --remove
./pokerv2/scripts/setup-auto-push-hook.sh --install

# Manual push (if hook fails)
git push origin gh-pages

# Check branch status
git status
git log --oneline -5
```

---

**🔄 The auto-push hook makes deployment seamless by automatically pushing your gh-pages branch after every commit!** 