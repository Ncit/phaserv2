# Remote Server Configuration

## Server URL Update

The client now connects to the remote server for all environments:

**Server URL**: `https://nikmobdev.ru/pokerserver`

## Environment Information

All environments now use the same remote server:
- **Development**: `https://nikmobdev.ru/pokerserver`
- **VKontakte**: `https://nikmobdev.ru/pokerserver`
- **Telegram**: `https://nikmobdev.ru/pokerserver`

## Verify Connection

### Check Current Environment
```javascript
env.current()  // Will return current environment (dev, vk, telegram)
```

### Check Server URL
```javascript
// The client will automatically connect to:
// https://nikmobdev.ru/pokerserver
```

### Test Connection
```bash
./pokerv2/scripts/test-remote-connection.sh
```

## Environment Switching

### Switch to Development
```javascript
env.switch("dev")
```

### Switch to VKontakte
```javascript
env.switch("vk")
```

### Switch to Telegram
```javascript
env.switch("telegram")
```

## Environment Information

| Environment | Server URL | Use Case |
|-------------|------------|----------|
| `dev` | `https://nikmobdev.ru/pokerserver` | Development |
| `vk` | `https://nikmobdev.ru/pokerserver` | VKontakte platform |
| `telegram` | `https://nikmobdev.ru/pokerserver` | Telegram platform |

## Troubleshooting

### Connection Issues
1. Check if remote server is running:
   ```bash
   ssh nikita@82.202.158.140 "sudo systemctl status pokerserver.service"
   ```

2. Check server logs:
   ```bash
   ssh nikita@82.202.158.140 "sudo journalctl -u pokerserver.service -f"
   ```

3. Test server directly:
   ```bash
   curl http://nikmobdev.ru/pokerserver/api/game
   ```

### Client Issues
1. Clear browser cache
2. Check browser console for errors
3. Verify environment is set correctly: `env.current()`

## Deployment

To deploy updates to the remote server:
```bash
./pokerv2/scripts/deploy-to-remote.sh
``` 