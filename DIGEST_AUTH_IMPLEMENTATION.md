# Axis Speaker - Digest Authentication Implementation

## Important Discovery ✅

**Postman works with Digest Auth** - This confirms:
- ✅ Device is accessible
- ✅ Credentials are correct  
- ✅ **Digest Authentication is required** (not Basic Auth)

## Understanding Digest vs Basic Auth

### Basic Authentication (What we tried first):
```
Authorization: Basic base64(username:password)
```
- Simple but less secure
- Sends credentials in every request
- Not accepted by Axis device

### Digest Authentication (What Axis requires):
```
1. Client requests resource
2. Server sends 401 with challenge (nonce, realm, etc.)
3. Client computes MD5 hash with credentials + challenge
4. Client sends hashed response
5. Server validates
```
- More secure (credentials never sent in plain text)
- Requires multi-step negotiation
- **Required by Axis VAPIX API**

## Browser Limitations

**Native browser APIs don't support Digest Auth:**
- ❌ `fetch()` - No digest auth support
- ❌ `XMLHttpRequest` - May trigger browser auth dialog, but doesn't work with CORS
- ✅ **Electron with npm packages** - Full support!

## Solution: Electron Implementation

### Step 1: Install Digest Auth Package

```powershell
cd e:\Vivek\API_MDs\audio-visualizer
npm install axios axios-digest-auth --save
```

### Step 2: Create Axis Streaming Module

Create `axis-streamer.js`:

```javascript
const axios = require('axios');
const AxiosDigestAuth = require('axios-digest-auth').default;

class AxisStreamer {
    constructor(ip, username, password) {
        this.ip = ip;
        this.digestAuth = new AxiosDigestAuth({
            username: username,
            password: password
        });
        this.baseUrl = `http://${ip}`;
    }

    /**
     * Test connection to Axis device
     */
    async testConnection() {
        try {
            const url = `${this.baseUrl}/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder`;
            const response = await this.digestAuth.request({
                method: 'GET',
                url: url
            });
            
            console.log('Device capabilities:', response.data);
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Connection test failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream audio data to Axis speaker
     * @param {Buffer} audioData - Audio data in G.711 µ-law format
     */
    async streamAudio(audioData) {
        try {
            const url = `${this.baseUrl}/axis-cgi/audio/transmit.cgi`;
            
            const response = await this.digestAuth.request({
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': 'audio/basic', // G.711 µ-law
                    'Content-Length': audioData.length
                },
                data: audioData
            });

            console.log('Audio streamed successfully');
            return { success: true };
        } catch (error) {
            console.error('Streaming failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream audio file
     * @param {string} filePath - Path to audio file
     */
    async streamAudioFile(filePath) {
        const fs = require('fs');
        const audioData = fs.readFileSync(filePath);
        
        // TODO: Convert audio to G.711 µ-law format
        // For now, assuming file is already in correct format
        
        return await this.streamAudio(audioData);
    }
}

module.exports = AxisStreamer;
```

### Step 3: Integrate into Main Process

Update `main.js`:

```javascript
const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const AxisStreamer = require('./axis-streamer');

let axisStreamer = null;

// ... existing code ...

// Add IPC handlers for Axis streaming
ipcMain.handle('axis-test-connection', async (event, config) => {
    const { ip, username, password } = config;
    axisStreamer = new AxisStreamer(ip, username, password);
    return await axisStreamer.testConnection();
});

ipcMain.handle('axis-stream-audio', async (event, audioData) => {
    if (!axisStreamer) {
        return { success: false, error: 'Not connected to Axis device' };
    }
    return await axisStreamer.streamAudio(audioData);
});

ipcMain.handle('axis-stream-file', async (event, filePath) => {
    if (!axisStreamer) {
        return { success: false, error: 'Not connected to Axis device' };
    }
    return await axisStreamer.streamAudioFile(filePath);
});
```

### Step 4: Update Preload Script

Update `preload.js`:

```javascript
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    // ... existing methods ...
    
    // Axis streaming methods
    axisTestConnection: (config) => ipcRenderer.invoke('axis-test-connection', config),
    axisStreamAudio: (audioData) => ipcRenderer.invoke('axis-stream-audio', audioData),
    axisStreamFile: (filePath) => ipcRenderer.invoke('axis-stream-file', filePath)
});
```

### Step 5: Add UI Controls

In `audio-visualizer.js`, add:

```javascript
// Axis streaming variables
let axisEnabled = false;
let axisConfig = { ip: '', username: '', password: '' };

// Test Axis connection
async function testAxisConnection() {
    if (!window.electron || !window.electron.axisTestConnection) {
        alert('Axis streaming is only available in the Electron app');
        return;
    }
    
    const ip = document.getElementById('axisIP').value;
    const username = document.getElementById('axisUsername').value;
    const password = document.getElementById('axisPassword').value;
    
    if (!ip || !username || !password) {
        alert('Please fill in all Axis device fields');
        return;
    }
    
    const result = await window.electron.axisTestConnection({ ip, username, password });
    
    if (result.success) {
        axisConfig = { ip, username, password };
        axisEnabled = true;
        document.getElementById('axisStatus').textContent = '✅ Connected to Axis device';
        document.getElementById('axisStatus').style.display = 'block';
        document.getElementById('axisStatus').style.background = '#d4edda';
        document.getElementById('axisStatus').style.color = '#155724';
    } else {
        document.getElementById('axisStatus').textContent = `❌ Connection failed: ${result.error}`;
        document.getElementById('axisStatus').style.display = 'block';
        document.getElementById('axisStatus').style.background = '#f8d7da';
        document.getElementById('axisStatus').style.color = '#721c24';
    }
}

// When audio is playing, optionally stream to Axis
function handleAudioPlaying() {
    if (axisEnabled && window.electron && window.electron.axisStreamFile) {
        // Get current playing audio file path
        const filePath = audio.src.replace('file:///', '');
        window.electron.axisStreamFile(filePath);
    }
}
```

## Quick Implementation Commands

Run these commands in your project directory:

```powershell
# Install required packages
npm install axios axios-digest-auth --save

# Create the streamer module
# (Copy the AxisStreamer class code above into axis-streamer.js)

# Update main.js with IPC handlers
# (Add the IPC handlers shown above)

# Update preload.js  
# (Add the exposedInMainWorld methods)

# Build new executable
npm run build
```

## Alternative: Using 'request-digest' Package

If axios-digest-auth doesn't work, use the 'request-digest' package:

```powershell
npm install request-digest --save
```

```javascript
const DigestClient = require('request-digest')('root', 'password');

DigestClient.request({
    host: '192.168.1.100',
    path: '/axis-cgi/audio/transmit.cgi',
    port: 80,
    method: 'POST',
    headers: {
        'Content-Type': 'audio/basic'
    }
}, function (error, response, body) {
    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Success:', body);
    }
});
```

## Testing Workflow

1. **Test with Postman first** (you confirmed this works) ✅
2. **Install npm packages** in Electron project
3. **Add Axis streaming module** (axis-streamer.js)
4. **Update main process** (main.js with IPC handlers)
5. **Update preload** (expose methods to renderer)
6. **Add UI** (optional - can test via console first)
7. **Build and test** with actual audio file

## Verification Steps

After implementation:

```javascript
// In Electron dev console, test:
const result = await window.electron.axisTestConnection({
    ip: '192.168.1.100',
    username: 'root',
    password: 'yourpassword'
});
console.log(result);
```

## Expected Results

✅ **With Digest Auth:**
- Connection test succeeds
- Device capabilities returned
- Audio streaming works

❌ **Without Digest Auth:**
- 401 Unauthorized errors
- Connection failures

## Summary

| Method | Digest Auth Support | Works with Axis |
|--------|-------------------|-----------------|
| Browser fetch() | ❌ No | ❌ No |
| XMLHttpRequest | ⚠️ Limited | ❌ No (CORS) |
| Postman | ✅ Yes | ✅ Yes (Confirmed) |
| Electron + axios-digest | ✅ Yes | ✅ Should work |
| Electron + request-digest | ✅ Yes | ✅ Should work |

## Next Step

**Would you like me to:**
1. Create the complete axis-streamer.js file
2. Update main.js with digest auth implementation
3. Add the npm packages to your package.json  
4. Create a test script to verify digest auth works

Let me know and I'll implement the full solution!

