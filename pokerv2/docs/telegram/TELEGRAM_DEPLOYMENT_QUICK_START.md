# 📱 Telegram Mini App - Quick Start Guide

## 🚀 **5-Minute Setup**

### **Step 1: Create Telegram Bot**
1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow instructions to create your bot
4. Save the bot token

### **Step 2: Setup Bot Configuration**
```bash
# Run the setup script
./pokerv2/scripts/setup-telegram-bot.sh --setup

# Follow the interactive prompts
# Enter your bot token and username
```

### **Step 3: Deploy Your App**
```bash
# Deploy to GitHub Pages
./pokerv2/scripts/setup-telegram-bot.sh --deploy
```

### **Step 4: Configure Bot with BotFather**
1. Send `/setdomain` to @BotFather
2. Set your GitHub Pages URL
3. Send `/setcommands` to @BotFather
4. Add: `start - Start the poker game`

### **Step 5: Test Your Mini App**
1. Open your bot in Telegram
2. Send `/start`
3. Click "Start Game" button
4. Your poker game loads!

## 🎯 **Quick Commands**

| Command | Description |
|---------|-------------|
| `./pokerv2/scripts/setup-telegram-bot.sh --setup` | Interactive bot setup |
| `./pokerv2/scripts/setup-telegram-bot.sh --deploy` | Deploy and configure |
| `./pokerv2/scripts/setup-telegram-bot.sh --test` | Test bot configuration |
| `./pokerv2/scripts/setup-telegram-bot.sh --config` | Show configuration |

## 📋 **BotFather Commands**

Send these to @BotFather:

```bash
/newbot          # Create new bot
/setdomain       # Set your GitHub Pages URL
/setcommands     # Set bot commands
/setmenubutton   # Configure menu button
```

## 🔧 **Environment Configuration**

Your app automatically detects Telegram environment:

```javascript
// URL parameter
https://yourdomain.com/?env=productionTelegram

// Hash fragment
https://yourdomain.com/#telegram

// Console command
env.switch("telegram")
```

## 🧪 **Testing Checklist**

- [ ] Bot responds to `/start`
- [ ] Mini App loads correctly
- [ ] Game functionality works
- [ ] User data integration works
- [ ] Performance is acceptable

## 🆘 **Troubleshooting**

### **Common Issues**

#### **1. Mini App Not Loading**
```javascript
// Check if running in Telegram
if (!window.Telegram || !window.Telegram.WebApp) {
    console.error('Not in Telegram Web App');
}
```

#### **2. Bot Token Invalid**
```bash
# Test bot token
./pokerv2/scripts/setup-telegram-bot.sh --test
```

#### **3. Domain Not Set**
- Send `/setdomain` to @BotFather
- Use your GitHub Pages URL

## 📊 **Success Metrics**

- ✅ Bot created and configured
- ✅ Mini App loads in Telegram
- ✅ Game functionality works
- ✅ User can play poker
- ✅ Performance is good

## 🎉 **You're Live!**

Your poker game is now available as a Telegram Mini App!

**Next Steps:**
- Share your bot with friends
- Monitor user engagement
- Gather feedback
- Plan updates and improvements

---

**📱 Your poker game is now accessible to millions of Telegram users worldwide!** 