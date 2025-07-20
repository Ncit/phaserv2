# 📱 Telegram Mini App Deployment Guide

This guide will walk you through the process of publishing your poker game as a Telegram Mini App.

## 🎯 **Overview**

Telegram Mini Apps are web applications that run inside Telegram, providing a native-like experience. Your poker game can be deployed as a Mini App to reach Telegram's massive user base.

## 📋 **Prerequisites**

### **Required Accounts**
- [Telegram Bot Token](https://core.telegram.org/bots#how-do-i-create-a-bot)
- [GitHub Account](for hosting)
- [Domain Name](optional, for custom domain)

### **Technical Requirements**
- HTTPS-enabled website
- Telegram Web App API integration
- Responsive design
- Fast loading times

## 🚀 **Step-by-Step Deployment**

### **Step 1: Prepare Your Application**

#### **1.1 Environment Configuration**
Ensure your app is configured for Telegram environment:

```javascript
// In your EnvironmentConfig.js
const telegramConfig = {
    name: 'telegram',
    debug: false,
    features: {
        playerSelection: false,
        debugLogging: false,
        mockData: false,
        ngrokHeaders: true,
        verboseErrors: false
    }
};
```

#### **1.2 Telegram Integration**
Make sure your app has proper Telegram Web App integration:

```javascript
// Check if Telegram Web App is available
if (window.Telegram && window.Telegram.WebApp) {
    // Initialize Telegram Web App
    window.Telegram.WebApp.ready();
    
    // Get user data
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    const chat = window.Telegram.WebApp.initDataUnsafe?.chat;
}
```

### **Step 2: Deploy to GitHub Pages**

#### **2.1 Build for Production**
```bash
# Navigate to your project
cd pokerv2

# Deploy to gh-pages branch
./scripts/deploy-to-gh-pages-simple.sh -m "Deploy for Telegram Mini App"
```

#### **2.2 Verify Deployment**
- Check your GitHub Pages URL: `https://yourusername.github.io/phaserv2/`
- Test the application thoroughly
- Ensure all features work correctly

### **Step 3: Create Telegram Bot**

#### **3.1 Create Bot via BotFather**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Save the bot token securely

#### **3.2 Configure Bot Settings**
```bash
# Set bot description
/newapp - Set your bot's description

# Set bot commands
/setcommands - Configure bot commands

# Set bot menu button
/setmenubutton - Configure menu button
```

### **Step 4: Configure Mini App**

#### **4.1 Set Web App URL**
```bash
# In BotFather chat
/setdomain - Set your GitHub Pages URL
# Example: https://yourusername.github.io/phaserv2/
```

#### **4.2 Configure Bot Commands**
```bash
# Set up commands for your bot
/setcommands

# Add these commands:
start - Start the poker game
play - Play poker
help - Get help
```

### **Step 5: Test Your Mini App**

#### **5.1 Test in Telegram**
1. Open your bot in Telegram
2. Send `/start` command
3. Click the "Start Game" button
4. Verify the Mini App loads correctly

#### **5.2 Debug Common Issues**
```javascript
// Add this to your main.js for debugging
if (window.Telegram && window.Telegram.WebApp) {
    console.log('Telegram Web App detected');
    console.log('User:', window.Telegram.WebApp.initDataUnsafe?.user);
    console.log('Chat:', window.Telegram.WebApp.initDataUnsafe?.chat);
} else {
    console.log('Not running in Telegram Web App');
}
```

## 🔧 **Advanced Configuration**

### **Custom Domain Setup**

#### **1. Purchase Domain**
- Buy a domain (e.g., `yourpokerapp.com`)
- Configure DNS settings

#### **2. Configure GitHub Pages**
```bash
# In your repository settings
# Go to Pages > Custom domain
# Enter your domain: yourpokerapp.com
```

#### **3. Update Bot Configuration**
```bash
# Update bot domain
/setdomain yourpokerapp.com
```

### **HTTPS Configuration**

#### **GitHub Pages (Automatic)**
- GitHub Pages automatically provides HTTPS
- No additional configuration needed

#### **Custom Domain**
- Configure SSL certificate
- Ensure HTTPS redirects work

### **Performance Optimization**

#### **1. Minimize Bundle Size**
```bash
# Optimize images
# Compress assets
# Minify JavaScript and CSS
```

#### **2. Enable Caching**
```html
<!-- Add cache headers -->
<meta http-equiv="Cache-Control" content="max-age=31536000">
```

#### **3. Optimize Loading**
```javascript
// Lazy load non-critical resources
// Preload critical assets
// Use CDN for libraries
```

## 📱 **Telegram Mini App Features**

### **User Interface Guidelines**

#### **1. Design Principles**
- Follow Telegram's design guidelines
- Use Telegram's color scheme
- Ensure responsive design
- Optimize for mobile

#### **2. Navigation**
```javascript
// Use Telegram's navigation
window.Telegram.WebApp.BackButton.show();
window.Telegram.WebApp.BackButton.onClick(() => {
    // Handle back navigation
});
```

#### **3. Main Button**
```javascript
// Configure main button
window.Telegram.WebApp.MainButton.setText('Play Poker');
window.Telegram.WebApp.MainButton.show();
window.Telegram.WebApp.MainButton.onClick(() => {
    // Handle main action
});
```

### **User Data Integration**

#### **1. Get User Information**
```javascript
const user = window.Telegram.WebApp.initDataUnsafe?.user;
if (user) {
    console.log('User ID:', user.id);
    console.log('Username:', user.username);
    console.log('First Name:', user.first_name);
    console.log('Last Name:', user.last_name);
}
```

#### **2. Get Chat Information**
```javascript
const chat = window.Telegram.WebApp.initDataUnsafe?.chat;
if (chat) {
    console.log('Chat ID:', chat.id);
    console.log('Chat Type:', chat.type);
    console.log('Chat Title:', chat.title);
}
```

## 🚀 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Application works in Telegram environment
- [ ] All features tested
- [ ] Performance optimized
- [ ] HTTPS enabled
- [ ] Responsive design verified

### **Bot Configuration**
- [ ] Bot created via BotFather
- [ ] Bot token saved securely
- [ ] Web App URL configured
- [ ] Bot commands set up
- [ ] Menu button configured

### **Testing**
- [ ] Mini App loads correctly
- [ ] User data integration works
- [ ] Game functionality tested
- [ ] Performance acceptable
- [ ] Error handling verified

### **Post-Deployment**
- [ ] Monitor for errors
- [ ] Track user engagement
- [ ] Gather feedback
- [ ] Plan updates

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Mini App Not Loading**
```javascript
// Check if running in Telegram
if (!window.Telegram || !window.Telegram.WebApp) {
    console.error('Not running in Telegram Web App');
    // Show fallback or redirect
}
```

#### **2. User Data Not Available**
```javascript
// Check user data availability
const user = window.Telegram.WebApp.initDataUnsafe?.user;
if (!user) {
    console.warn('User data not available');
    // Handle gracefully
}
```

#### **3. HTTPS Issues**
```bash
# Verify HTTPS is working
curl -I https://yourdomain.com

# Check SSL certificate
openssl s_client -connect yourdomain.com:443
```

#### **4. Performance Issues**
```javascript
// Monitor loading times
console.time('app-load');
// Your app initialization
console.timeEnd('app-load');
```

### **Debug Commands**
```javascript
// Debug Telegram Web App
console.log('Telegram Web App:', window.Telegram?.WebApp);
console.log('Init Data:', window.Telegram?.WebApp?.initData);
console.log('User:', window.Telegram?.WebApp?.initDataUnsafe?.user);
```

## 📊 **Analytics and Monitoring**

### **Telegram Analytics**
```javascript
// Track user interactions
window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
    // Track main button clicks
});

window.Telegram.WebApp.onEvent('backButtonClicked', () => {
    // Track back button clicks
});
```

### **Custom Analytics**
```javascript
// Implement your own analytics
function trackEvent(eventName, data) {
    // Send to your analytics service
    console.log('Event:', eventName, data);
}
```

## 🔄 **Updates and Maintenance**

### **Deploying Updates**
```bash
# Deploy new version
./scripts/deploy-to-gh-pages-simple.sh -m "Update Mini App"

# Test in Telegram
# Monitor for issues
```

### **Version Management**
```javascript
// Add version tracking
const APP_VERSION = '1.0.0';
console.log('Poker Game Version:', APP_VERSION);
```

## 📚 **Resources**

### **Official Documentation**
- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram Web App API](https://core.telegram.org/bots/webapps#initializing-web-apps)

### **Tools and Services**
- [BotFather](https://t.me/botfather) - Bot creation and management
- [GitHub Pages](https://pages.github.com/) - Free hosting
- [Telegram Web App Validator](https://core.telegram.org/bots/webapps#validating-data)

### **Community**
- [Telegram Developers](https://t.me/telegramdev) - Developer community
- [Telegram Mini Apps](https://t.me/miniapps) - Mini Apps community

## 🎯 **Best Practices**

### **1. User Experience**
- Keep the app simple and intuitive
- Optimize for mobile devices
- Provide clear navigation
- Handle errors gracefully

### **2. Performance**
- Minimize loading times
- Optimize asset sizes
- Use efficient algorithms
- Implement caching

### **3. Security**
- Validate all user inputs
- Use HTTPS for all communications
- Implement proper authentication
- Follow security best practices

### **4. Testing**
- Test on various devices
- Test with different user scenarios
- Monitor performance metrics
- Gather user feedback

---

**📱 Your poker game is now ready to be deployed as a Telegram Mini App! Follow this guide to reach millions of Telegram users worldwide.** 