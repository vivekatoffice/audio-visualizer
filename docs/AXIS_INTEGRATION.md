# Axis Speaker Integration Guide

## Overview

This document explains how to integrate audio streaming to Axis speakers using the VAPIX Audio API. The integration allows you to send audio from the visualizer to an Axis network speaker in real-time.

## Test File

**`axis-stream-test.html`** - Standalone test page for browser testing

### Features:
- ✅ Device connection testing
- ✅ Audio file selection
- ✅ Real-time streaming to Axis speaker
- ✅ Status feedback
- ✅ Easy configuration UI

## VAPIX API Details

### Endpoint
```
POST http://<device-ip>/axis-cgi/audio/transmit.cgi
```

### Authentication
- **Type**: HTTP Basic Authentication
- **Security Level**: Viewer

### Headers
```
Content-Type: audio/basic  (for G.711 µ-law)
Authorization: Basic <base64(username:password)>
```

### Supported Audio Formats

| Format | MIME Type | Description |
|--------|-----------|-------------|
| **G.711 µ-law** | `audio/basic` | 8 kHz, 8-bit, mono |
| **G.711 a-law** | `audio/x-alaw-basic` | 8 kHz, 8-bit, mono |
| **G.726** | `audio/G726-16`, `audio/G726-24`, `audio/G726-32`, `audio/G726-40` | Various bitrates |
| **AAC** | `audio/aac` | Advanced Audio Coding |
| **Opus** | `audio/opus` | High-quality, low-latency |

## How to Test

### Step 1: Configure Axis Device
1. Enter the IP address of your Axis speaker (e.g., `192.168.1.100`)
2. Enter username (default: `root`)
3. Enter password
4. Click **"Test Connection"** to verify

### Step 2: Select Audio File
1. Click "Choose File"
2. Select an audio file (.mp3, .wav, .m4a)
3. File info will be displayed

### Step 3: Stream Audio
1. Click **"Stream to Axis Speaker"**
2. Audio will be converted and sent to the Axis device
3. Watch for status messages

## Browser Limitations

⚠️ **CORS (Cross-Origin Resource Sharing) Restrictions**

Modern browsers block direct HTTP requests to devices on different origins for security reasons. You may encounter CORS errors when testing in browser.

**Solutions:**
1. **Use the Electron app** (recommended) - No CORS restrictions
2. **Configure CORS on Axis device** - If supported
3. **Use a proxy server** - Route requests through a same-origin proxy
4. **Disable browser security** (for testing only, not recommended)

## Integration with Audio Visualizer

To integrate this with the main Audio Visualizer app, we need to:

### 1. Add UI Controls (in `audio-visualizer.html`)
```html
<!-- Axis Speaker Configuration -->
<div class="axis-config">
    <h3>Stream to Axis Speaker</h3>
    <input type="checkbox" id="enableAxisStream">
    <label for="enableAxisStream">Enable Axis Streaming</label>
    
    <div id="axisSettings" style="display: none;">
        <input type="text" id="axisIP" placeholder="Device IP">
        <input type="text" id="axisUser" placeholder="Username">
        <input type="password" id="axisPass" placeholder="Password">
    </div>
</div>
```

### 2. Add Streaming Logic (in `audio-visualizer.js`)
```javascript
// Axis streaming variables
let axisStreamEnabled = false;
let axisConfig = { ip: '', username: '', password: '' };
let audioStreamInterval = null;

// Enable/disable axis streaming
function toggleAxisStreaming(enabled) {
    axisStreamEnabled = enabled;
    if (enabled) {
        startAxisStream();
    } else {
        stopAxisStream();
    }
}

// Stream audio chunks to Axis
async function sendAudioToAxis(audioData) {
    const url = `http://${axisConfig.ip}/axis-cgi/audio/transmit.cgi`;
    const auth = btoa(`${axisConfig.username}:${axisConfig.password}`);
    
    try {
        await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'audio/basic'
            },
            body: audioData
        });
    } catch (error) {
        console.error('Axis streaming error:', error);
    }
}
```

### 3. Modify Electron Main Process (in `main.js`)

Since browsers have CORS restrictions, the Electron app can bypass this:

```javascript
// In main.js - handle Axis streaming via Electron
const { net } = require('electron');

function streamToAxis(ip, username, password, audioData) {
    const request = net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: ip,
        port: 80,
        path: '/axis-cgi/audio/transmit.cgi'
    });
    
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    request.setHeader('Authorization', `Basic ${auth}`);
    request.setHeader('Content-Type', 'audio/basic');
    request.setHeader('Content-Length', audioData.length);
    
    request.write(audioData);
    request.end();
    
    request.on('response', (response) => {
        console.log(`Axis response: ${response.statusCode}`);
    });
    
    request.on('error', (error) => {
        console.error('Axis streaming error:', error);
    });
}
```

## Audio Format Conversion

The Axis API requires specific audio formats. For best compatibility:

### For G.711 µ-law (most compatible):
- **Sample Rate**: 8000 Hz
- **Bit Depth**: 8-bit
- **Channels**: Mono
- **Encoding**: µ-law compression

### Conversion Process:
1. Decode audio file to PCM
2. Resample to 8 kHz if necessary
3. Convert to mono if stereo
4. Apply µ-law encoding
5. Stream in chunks

## Streaming Architecture

```
┌─────────────────┐
│  Audio Source   │
│  (File/Mic)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Web Audio API   │
│ Decode & Process│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Format Convert │
│  (PCM → µ-law)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ HTTP POST       │
│ transmit.cgi    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Axis Speaker   │
│  (Playback)     │
└─────────────────┘
```

## Error Handling

### Common Errors:

| Error Code | Meaning | Solution |
|------------|---------|----------|
| **400** | Bad Request | Check audio format and content-type |
| **401** | Unauthorized | Verify username/password |
| **405** | Method Not Allowed | Ensure using POST method |
| **415** | Unsupported Media Type | Check Content-Type header |
| **503** | Service Unavailable | Speaker may be busy or offline |

### Error Response Example:
```
HTTP/1.1 415 Unsupported Media Type
Content-Type: text/plain

Unsupported audio format
```

## Testing Checklist

- [ ] Axis device is powered on and connected to network
- [ ] Device IP is correct and reachable (ping test)
- [ ] Username and password are correct
- [ ] Audio formats supported by device are checked
- [ ] CORS is handled (use Electron or proxy)
- [ ] Audio file is in compatible format
- [ ] Network firewall allows HTTP traffic
- [ ] Device has audio output configured

## Advanced Features

### 1. Real-time Streaming
For continuous streaming (like microphone input):
- Use smaller audio chunks
- Send continuously without closing connection
- Monitor latency

### 2. Audio Mixing
Mix visualization audio with live microphone:
```javascript
// Create audio mix
const mixer = audioContext.createGain();
micInput.connect(mixer);
fileInput.connect(mixer);
mixer.connect(axisStream);
```

### 3. Quality Settings
Adjust based on network conditions:
- Lower bitrate for poor connections
- Use Opus for best quality/bandwidth ratio
- Implement adaptive bitrate streaming

## Security Considerations

1. **Never hardcode credentials** - Always use environment variables or secure input
2. **Use HTTPS** - If Axis device supports it
3. **Validate inputs** - Sanitize IP addresses and user inputs
4. **Token-based auth** - Use if available instead of Basic Auth
5. **Network security** - Ensure devices are on trusted network

## Troubleshooting

### Problem: "CORS policy" error in browser
**Solution**: Use the Electron app or set up a proxy

### Problem: "Network error" or timeout
**Solution**: 
- Verify device IP is correct
- Check if device is on same network
- Ping the device: `ping 192.168.1.100`

### Problem: No audio output from speaker
**Solution**:
- Check device audio configuration
- Verify audio format is supported
- Test with simpler format (G.711 µ-law)

### Problem: Authentication failed
**Solution**:
- Verify credentials in web interface first
- Check for special characters in password
- Ensure user has "Viewer" permissions

## Next Steps

To fully integrate into the main application:

1. **Add UI Elements** - Create settings panel for Axis configuration
2. **Implement Audio Encoding** - Add proper µ-law encoding library
3. **Handle Streaming** - Use Electron's `net` module for reliable streaming
4. **Add Visual Feedback** - Show streaming status in UI
5. **Error Recovery** - Implement reconnection logic
6. **Testing** - Test with actual Axis hardware

## Resources

- [VAPIX Audio API Documentation](https://developer.axis.com/vapix/audio-systems/audio-api/)
- [Audio Device Control API](https://developer.axis.com/vapix/audio-systems/audio-device-control/)
- [Axis Developer Portal](https://developer.axis.com/)

## License Notice

When using VAPIX APIs, ensure compliance with Axis Communications licensing terms.

---

**Created**: 2025-12-05  
**Version**: 1.0.0  
**Status**: Testing Phase
