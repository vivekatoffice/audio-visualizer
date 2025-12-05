# Axis Speaker Integration - Quick Start

## 🎯 What Was Created

### 1. **axis-stream-test.html** - Browser Test Page
A standalone web page for testing audio streaming to Axis speakers before integrating into the main app.

**Features:**
- ✅ Beautiful, modern UI
- ✅ Device IP, username, password configuration
- ✅ Connection testing
- ✅ Audio file selection
- ✅ Real-time streaming
- ✅ Status feedback

**How to Use:**
1. Open `axis-stream-test.html` in your browser (already opened)
2. Enter your Axis device IP, username, and password
3. Click "Test Connection" to verify device is reachable
4. Select an audio file
5. Click "Stream to Axis Speaker"

### 2. **AXIS_INTEGRATION.md** - Complete Documentation
Comprehensive guide covering:
- VAPIX API details
- Supported audio formats
- Integration architecture
- Code examples
- Troubleshooting
- Security considerations

## ⚠️ Important Notes

### CORS Limitations
**The browser test may fail due to CORS (Cross-Origin Resource Sharing) restrictions.**

This is a browser security feature that prevents web pages from making requests to different origins (your device).

**You will likely see an error like:**
```
Access to fetch at 'http://192.168.1.100/axis-cgi/...' from origin 'null' 
has been blocked by CORS policy
```

### Solutions:

#### ✅ Option 1: Use Electron App (Recommended)
The Electron app doesn't have CORS restrictions and can make direct HTTP requests to your Axis device. This is the best option for production.

#### ⚠️ Option 2: For Testing Only
You can temporarily disable browser security **FOR TESTING ONLY**:

**Chrome:**
```powershell
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

**Edge:**
```powershell
msedge.exe --user-data-dir="C:/Edge dev session" --disable-web-security
```

⚠️ **WARNING**: Never browse the internet with security disabled!

#### 🔧 Option 3: Configure Axis Device
Some Axis devices allow CORS configuration. Check your device documentation.

##📡 How Axis Streaming Works

```
┌────────────┐         ┌──────────────┐         ┌─────────────┐
│ Audio File │  ─────> │ Web Audio API│  ─────> │ PCM Decoder │
└────────────┘         └──────────────┘         └─────────────┘
                                                        │
                                                        ▼
┌────────────┐         ┌──────────────┐         ┌─────────────┐
│   Axis     │ <────── │  HTTP POST   │ <────── │ µ-law Encode│
│  Speaker   │         │transmit.cgi  │         │             │
└────────────┘         └──────────────┘         └─────────────┘
```

## 🔍 API Endpoint

```
POST http://<device-ip>/axis-cgi/audio/transmit.cgi
```

### Headers:
```
Content-Type: audio/basic
Authorization: Basic <base64(username:password)>
```

### Audio Format (G.711 µ-law):
- **Sample Rate**: 8000 Hz
- **Channels**: Mono
- **Bit Depth**: 8-bit
- **Encoding**: µ-law compression

## 🧪 Testing Steps

### 1. Test Connection
First, verify your Axis device is reachable:

```powershell
ping 192.168.1.100
```

### 2. Test API Access
You can test the API using curl:

```powershell
curl --request GET --anyauth --user "root:password" "http://192.168.1.100/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder"
```

This should return supported audio formats.

### 3. Use the Test Page
1. Open `axis-stream-test.html`
2. Configure your device settings
3. Test connection
4. Stream audio

## 🚀 Next Steps for Full Integration

To integrate this into the main Audio Visualizer app:

### 1. Add UI Controls
Add Axis speaker configuration panel to `audio-visualizer.html`

### 2. Implement Streaming in Electron
Use Electron's `net` module (bypasses CORS) in `main.js`

### 3. Add Audio Processing
Convert audio to proper format (G.711 µ-law)

### 4. Add Visual Feedback
Show streaming status in the visualizer UI

### 5. Error Handling
Implement reconnection and error recovery

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `axis-stream-test.html` | Browser test page with UI |
| `AXIS_INTEGRATION.md` | Complete integration guide |
| `README.md` | Main project documentation |
| `USER_MANUAL.md` | User documentation |

## 🎓 Key Concepts

### VAPIX API
Axis's RESTful API for controlling their devices. The `/axis-cgi/audio/transmit.cgi` endpoint accepts audio data via HTTP POST.

### G.711 µ-law
A standard audio codec for telephony. It's widely supported and provides good quality for speech at 64 kbit/s.

### Basic Authentication
Simple HTTP authentication using base64-encoded username:password.

## ⚙️ Device Requirements

Your Axis device must:
- ✅ Have audio playback capability (speaker)
- ✅ Be accessible on the network
- ✅ Have HTTP API enabled
- ✅ Support G.711 µ-law (most do)

## 🐛 Common Issues

### Issue: Cannot connect to device
- Check IP address
- Verify device is on network
- Check firewall settings

### Issue: Authentication failed
- Verify username/password
- Check user permissions (need "Viewer" level)

### Issue: Audio format not supported
- Try G.711 µ-law (`audio/basic`)
- Check device capabilities via API

### Issue: CORS error in browser
- Use Electron app instead
- Or follow Option 2 for testing

## 💡 Tips

1. **Start Simple**: Test with G.711 µ-law first - it's universally supported
2. **Network**: Keep device on same subnet for best performance
3. **Security**: Never expose devices directly to internet
4. **Testing**: Use the test page before integrating
5. **Latency**: Expect 100-300ms latency depending on network

## 📞 Support

For Axis-specific issues, refer to:
- [Axis Developer Portal](https://developer.axis.com/)
- [VAPIX Documentation](https://developer.axis.com/vapix/)
- Device user manual

---

**Happy Streaming! 🎵📡**
