# Release Notes v1.1.0 - Axis Speaker Integration 🎵🔊

## 🚀 New Features

### 🔊 Axis Network Speaker Support
- **Direct Streaming**: Stream audio directly from the visualizer to Axis network speakers.
- **Digest Authentication**: Securely connect to Axis devices using Digest Auth (handled automatically).
- **Format Conversion**: Automatically converts any audio format (MP3, WAV, FLAC, etc.) to the required G.711 µ-law format.
- **Real-time Control**: 
  - Enable/Disable streaming on the fly.
  - Test connection button (sends a beep).
  - Stop streaming instantly.

## 🛠️ Improvements
- **UI Updates**: Added new configuration panel for Axis devices.
- **Performance**: Optimized audio processing using FFmpeg.
- **Reliability**: Bundled FFmpeg for consistent behavior across all Windows systems.

## 📦 Installation

### Installer (Recommended)
1. Download `Audio Visualizer Setup 1.0.0.exe` (Note: Version number in filename might still be 1.0.0, but it contains v1.1.0 features).
2. Run the installer.
3. Launch "Audio Visualizer" from your desktop or start menu.

### Portable Version
1. Download `Audio.Visualizer.v1.1.0.Axis.Portable.zip`.
2. Extract the ZIP file to any folder.
3. Run `Audio Visualizer.exe`.

## ⚙️ How to Use Axis Streaming
1. Open the app.
2. Check the **"🔊 Stream to Axis Speaker"** box in the settings.
3. Enter your device details (Defaults: IP `10.176.13.98`, User `root`, Pass `pass`).
4. Click **"🔌 Test Connection"** to verify.
5. Play any music file! 🎵

## 📋 Requirements
- Windows 10/11
- Axis Network Speaker (or Audio Bridge)
- Network connection to the device
