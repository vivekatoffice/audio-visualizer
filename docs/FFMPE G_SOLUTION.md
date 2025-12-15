# Axis Audio Streaming - Working Solution with FFmpeg

## ✅ WORKING COMMAND

```bash
ffmpeg.exe -i "s1.wav" \
  -probesize 32 \
  -analyzeduration 32 \
  -c:a pcm_mulaw \
  -ab 128k \
  -ac 1 \
  -ar 16000 \
  -f wav \
  -chunked_post 0 \
  -content_type audio/axis-mulaw-128 \
  http://root:pass@10.176.12.98/axis-cgi/audio/transmit.cgi
```

## 📋 Command Breakdown

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `-i "s1.wav"` | Input file | Source audio file |
| `-probesize 32` | 32 bytes | Minimal probe size |
| `-analyzeduration 32` | 32 microsec | Fast analysis |
| `-c:a pcm_mulaw` | **µ-law PCM** | Audio codec (G.711 µ-law) |
| `-ab 128k` | 128 kbit/s | Audio bitrate |
| `-ac 1` | **Mono** | 1 audio channel |
| `-ar 16000` | **16 kHz** | Sample rate |
| `-f wav` | WAV format | Output format |
| `-chunked_post 0` | Disabled | No chunked transfer |
| `-content_type` | `audio/axis-mulaw-128` | **Axis-specific MIME type** |

## 🎯 Key Findings

### Critical Parameters:
1. **Content-Type**: `audio/axis-mulaw-128` (NOT `audio/basic`)
2. **Sample Rate**: 16000 Hz (NOT 8000 Hz)
3. **Codec**: pcm_mulaw (µ-law PCM)
4. **Channels**: Mono (1 channel)
5. **Authentication**: Embedded in URL (`http://user:pass@host`)

### Why FFmpeg is Perfect:
- ✅ Handles Digest Auth automatically
- ✅ Converts audio format on-the-fly
- ✅ Works with any input audio format
- ✅ Reliable and battle-tested
- ✅ Easy to integrate into Electron

## 🚀 Electron Integration

### Step 1: Add FFmpeg to Project

Download ffmpeg.exe and place it in your project:
```
audio-visualizer/
  ├── ffmpeg.exe  <-- Place here
  ├── main.js
  └── ...
```

Or use ffmpeg-static npm package:
```bash
npm install ffmpeg-static --save
```

### Step 2: Create Streaming Module

**File: `axis-ffmpeg-streamer.js`**

```javascript
const { spawn } = require('child_process');
const path = require('path');
const ffmpegStatic = require('ffmpeg-static'); // Or path to ffmpeg.exe

class AxisFFmpegStreamer {
    constructor(ip, username, password) {
        this.ip = ip;
        this.username = username;
        this.password = password;
        this.ffmpegPath = ffmpegStatic || 'ffmpeg.exe';
    }

    /**
     * Stream audio file to Axis speaker
     * @param {string} inputFile - Path to audio file (any format)
     */
    async streamAudio(inputFile) {
        return new Promise((resolve, reject) => {
            const url = `http://${this.username}:${this.password}@${this.ip}/axis-cgi/audio/transmit.cgi`;
            
            const args = [
                '-i', inputFile,
                '-probesize', '32',
                '-analyzeduration', '32',
                '-c:a', 'pcm_mulaw',
                '-ab', '128k',
                '-ac', '1',
                '-ar', '16000',
                '-f', 'wav',
                '-chunked_post', '0',
                '-content_type', 'audio/axis-mulaw-128',
                url
            ];

            console.log(`Streaming: ${inputFile} -> ${this.ip}`);
            
            const ffmpeg = spawn(this.ffmpegPath, args);
            
            ffmpeg.stdout.on('data', (data) => {
                console.log(`FFmpeg: ${data}`);
            });
            
            ffmpeg.stderr.on('data', (data) => {
                // FFmpeg outputs progress to stderr
                console.log(`Progress: ${data}`);
            });
            
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Audio streamed successfully!');
                    resolve({ success: true });
                } else {
                    console.error(`❌ FFmpeg exited with code ${code}`);
                    reject({ success: false, error: `Exit code ${code}` });
                }
            });
            
            ffmpeg.on('error', (err) => {
                console.error('❌ FFmpeg error:', err);
                reject({ success: false, error: err.message });
            });
        });
    }

    /**
     * Test connection by streaming a short beep
     */
    async testConnection() {
        // Generate 1 second of silence/beep
        return new Promise((resolve, reject) => {
            const url = `http://${this.username}:${this.password}@${this.ip}/axis-cgi/audio/transmit.cgi`;
            
            const args = [
                '-f', 'lavfi',
                '-i', 'sine=frequency=1000:duration=1',
                '-c:a', 'pcm_mulaw',
                '-ab', '128k',
                '-ac', '1',
                '-ar', '16000',
                '-f', 'wav',
                '-chunked_post', '0',
                '-content_type', 'audio/axis-mulaw-128',
                url
            ];

            const ffmpeg = spawn(this.ffmpegPath, args);
            
            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, message: 'Test beep sent successfully' });
                } else {
                    reject({ success: false, error: `Exit code ${code}` });
                }
            });
        });
    }
}

module.exports = AxisFFmpegStreamer;
```

### Step 3: Use in Your App

```javascript
const AxisFFmpegStreamer = require('./axis-ffmpeg-streamer');

// Create streamer
const streamer = new AxisFFmpegStreamer('10.176.12.98', 'root', 'pass');

// Stream any audio file
await streamer.streamAudio('path/to/song.mp3');  // FFmpeg converts automatically!
```

## 🎵 Supported Input Formats

Since FFmpeg handles conversion, you can stream **ANY** audio format:
- ✅ MP3
- ✅ M4A
- ✅ WAV
- ✅ FLAC
- ✅ OGG
- ✅ AAC
- ✅ And many more!

FFmpeg converts everything to the required format (16kHz, mono, µ-law PCM).

## 💻 Integration into Audio Visualizer

### Option 1: Stream Currently Playing Audio

```javascript
// In audio-visualizer.js

// When audio starts playing
function handleAudioPlaying() {
    if (axisStreamingEnabled) {
        const audioFilePath = audio.src.replace('file:///', '');
        
        // Send to main process via IPC
        window.electron.streamToAxis(audioFilePath);
    }
}
```

### Option 2: Real-time Streaming (Advanced)

For real-time streaming of audio being played:
1. Capture audio output using Web Audio API
2. Save chunks to temp file
3. Stream chunks to Axis using FFmpeg

## 📝 Complete Example Script

**File: `stream-to-axis.js`**

```javascript
const AxisFFmpegStreamer = require('./axis-ffmpeg-streamer');

const config = {
    ip: '10.176.12.98',
    username: 'root',
    password: 'pass'
};

async function main() {
    const streamer = new AxisFFmpegStreamer(config.ip, config.username, config.password);
    
    // Get audio file from command line or hardcode
    const audioFile = process.argv[2] || 's1.wav';
    
    console.log(`Streaming ${audioFile} to Axis speaker at ${config.ip}...`);
    
    try {
        await streamer.streamAudio(audioFile);
        console.log('Done!');
    } catch (error) {
        console.error('Failed:', error);
    }
}

main();
```

**Usage:**
```bash
node stream-to-axis.js "path/to/your/audio.mp3"
```

## 🎯 Advantages of FFmpeg Approach

| Feature | FFmpeg | Pure Node.js |
|---------|--------|--------------|
| **Digest Auth** | ✅ Built-in | ❌ Library issues |
| **Format Conversion** | ✅ Automatic | ❌ Manual coding |
| **Reliability** | ✅ Battle-tested | ⚠️ Depends on libs |
| **Input Formats** | ✅ All formats | ❌ Limited |
| **Complexity** | ✅ Simple | ❌ Complex |
| **Maintenance** | ✅ Easy | ❌ Difficult |

## 🔧 Installation

### Method 1: Manual (Simple)
1. Download FFmpeg from https://ffmpeg.org/download.html
2. Extract `ffmpeg.exe`
3. Place in project folder
4. Update code to use `./ffmpeg.exe`

### Method 2: NPM Package (Recommended)
```bash
npm install ffmpeg-static --save
```

This includes FFmpeg binary in your app automatically!

## 🎉 Summary

**Problem Solved!**
- ✅ FFmpeg handles Digest Auth
- ✅ Converts any audio format
- ✅ Simple integration
- ✅ Proven working solution

**Next Steps:**
1. Install ffmpeg-static npm package
2. Create axis-ffmpeg-streamer.js
3. Integrate into your Audio Visualizer
4. Test and enjoy!

---

**Your Audio Visualizer can now stream to Axis speakers!** 🔊🎵

