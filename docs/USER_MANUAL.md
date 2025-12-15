# 🎵 Audio Visualizer - User Manual

## Table of Contents
- [Overview](#overview)
- [Getting Started](#getting-started)
- [Supported File Formats](#supported-file-formats)
- [User Interface](#user-interface)
- [Controls & Shortcuts](#controls--shortcuts)
- [Visualization Modes](#visualization-modes)
- [Settings & Customization](#settings--customization)
- [Tips for Best Experience](#tips-for-best-experience)
- [Troubleshooting](#troubleshooting)

---

## Overview

**Audio Visualizer** is a stunning 3D audio visualization application that brings your music to life with real-time frequency analysis and beautiful visual effects. Built with Electron and Three.js, it provides an immersive audio-visual experience.

### Key Features
- ✨ **4 Unique Visualization Modes** - Frequency Bars, Pulsing Sphere, Wave Particles, and Expanding Rings
- 🎨 **Real-time Audio Analysis** - See bass, mid, and treble frequencies visualized in 3D
- 🎛️ **Customizable Settings** - Adjust sensitivity and switch between visualization styles
- 🖥️ **Desktop Application** - Runs smoothly on Windows without a browser
- 🎧 **Multiple Audio Format Support** - Works with M4A, MP3, WAV, OGG, FLAC, and AAC files

---

## Getting Started

### Installation
1. **Run the Installer**: Double-click `Audio Visualizer Setup 1.0.0.exe`
2. **Choose Installation Location**: Select where you want to install the app
3. **Create Shortcuts**: The installer will create desktop and start menu shortcuts
4. **Launch**: Click the desktop icon or find it in the start menu

### First Use
1. **Launch the Application**: Open Audio Visualizer from your desktop or start menu
2. **Load an Audio File**: Click "Choose Audio File" or use `Ctrl+O`
3. **Select Your Music**: Browse and select an audio file from your computer
4. **Press Play**: Click the play button or press spacebar to start
5. **Enjoy**: Watch your music come to life in 3D!

---

## Supported File Formats

The Audio Visualizer supports a wide range of audio formats:

### Primary Formats (Recommended)
| Format | Extension | Quality | Notes |
|--------|-----------|---------|-------|
| **M4A** | `.m4a` | High | Apple Audio, excellent quality |
| **MP3** | `.mp3` | Good | Most common format |
| **FLAC** | `.flac` | Highest | Lossless audio |
| **WAV** | `.wav` | Highest | Uncompressed audio |

### Additional Supported Formats
| Format | Extension | Notes |
|--------|-----------|-------|
| **OGG** | `.ogg` | Open source format |
| **AAC** | `.aac` | Advanced Audio Coding |

### File Requirements
- ✅ **File Size**: No strict limit, but larger files may take longer to load
- ✅ **Duration**: Any length supported
- ✅ **Bitrate**: All bitrates supported (higher bitrate = better visualization)
- ✅ **Channels**: Stereo and mono supported

---

## User Interface

### Main Components

#### 1. **Header Section**
- Application title and tagline
- Always visible at the top

#### 2. **Control Panel (Glass Card)**
- **File Upload Button**: Choose and load audio files
- **Play/Pause Button**: Control playback
- **Progress Bar**: Track playback position and seek
- **Time Display**: Shows current time and total duration
- **Volume Control**: Adjust playback volume (0-100%)

#### 3. **Visualization Settings**
- **Style Selector**: Choose between 4 visualization modes
- **Sensitivity Slider**: Adjust visualization responsiveness (1-10)

#### 4. **Stats Display**
Real-time audio frequency information:
- **Frequency**: Average frequency level
- **Bass**: Low-frequency levels
- **Treble**: High-frequency levels

#### 5. **3D Canvas**
Full-screen background showing the active visualization

---

## Controls & Shortcuts

### Mouse Controls
| Action | Function |
|--------|----------|
| **Click Play Button** | Start/pause playback |
| **Click Progress Bar** | Jump to specific position in track |
| **Drag Volume Slider** | Adjust volume |
| **Hover on UI** | Keep controls visible |

### Keyboard Shortcuts
| Shortcut | Function |
|----------|----------|
| **Ctrl + O** | Open audio file dialog |
| **Space** | Play/Pause toggle |
| **H** | Show/Hide controls |
| **F11** | Toggle fullscreen mode |
| **Ctrl + R** | Reload application |
| **Ctrl + Shift + I** | Open Developer Tools (advanced) |
| **Alt + F4** | Exit application |

### Menu Bar Navigation

#### File Menu
- **Open Audio File** (`Ctrl+O`) - Load new audio
- **Exit** (`Alt+F4`) - Close application

#### View Menu
- **Reload** (`Ctrl+R`) - Refresh the app
- **Toggle Fullscreen** (`F11`) - Fullscreen mode
- **Toggle Developer Tools** (`Ctrl+Shift+I`) - For debugging

#### Visualization Menu
- **Frequency Bars** - Switch to bar visualization
- **Pulsing Sphere** - Switch to sphere visualization
- **Wave Particles** - Switch to wave visualization
- **Expanding Rings** - Switch to ring visualization

#### Help Menu
- **About** - Application information
- **Keyboard Shortcuts** - Quick reference guide

---

## Visualization Modes

### 1. 🎚️ Frequency Bars
**Best for**: Electronic music, hip-hop, bass-heavy tracks

Creates a 3D grid of bars that react to different frequency ranges. Each bar represents a specific frequency band:
- **Height**: Amplitude of that frequency
- **Color**: Changes based on intensity
- **Movement**: Responsive to beat and rhythm

### 2. 🌐 Pulsing Sphere (Default)
**Best for**: Classical music, ambient tracks, vocal-heavy songs

A dynamic sphere that:
- **Expands/Contracts**: Based on overall audio intensity
- **Surface Distortion**: Reacts to frequency changes
- **Color Shifts**: Follows the music's mood
- **Rotation**: Smooth automatic rotation

### 3. 🌊 Wave Particles
**Best for**: Trance, chill-out, atmospheric music

Thousands of particles forming wave patterns:
- **Particle Movement**: Flows with audio waves
- **Density**: Varies with volume
- **Color Gradients**: Smooth transitions
- **Wave Formation**: Follows frequency patterns

### 4. 💫 Expanding Rings
**Best for**: Rock, metal, high-energy tracks

Concentric rings that pulse outward:
- **Ring Count**: Based on beat detection
- **Expansion Speed**: Follows tempo
- **Brightness**: Intensity-based
- **Color**: Frequency-dependent

---

## Settings & Customization

### Sensitivity Adjustment
The sensitivity slider (1-10) controls how reactive the visualization is:

- **Low (1-3)**: Subtle, smooth movements - good for calm music
- **Medium (4-6)**: Balanced response - recommended for most tracks
- **High (7-10)**: Highly reactive - great for energetic music

### Volume Control
- Range: 0% to 100%
- Default: 70%
- Tip: Keep volume at 70-80% and adjust system volume for best audio quality

### Auto-Hide Controls
- Controls automatically fade out after 3 seconds of inactivity
- Move your mouse or press **H** to show them again
- Perfect for immersive, distraction-free viewing

---

## Tips for Best Experience

### 🎵 For Best Audio Quality
1. Use **FLAC** or **WAV** files for highest fidelity
2. Select tracks with **320kbps** bitrate or higher for MP3
3. Avoid heavily compressed audio files

### 🖥️ For Best Visual Experience
1. Use **fullscreen mode** (F11) for maximum immersion
2. Choose visualization mode that matches your music genre
3. Adjust **sensitivity** based on the track's dynamics
4. Dim room lights for better visual impact

### 🎨 Matching Visualization to Music
- **Orchestral/Classical**: Pulsing Sphere
- **Electronic/EDM**: Frequency Bars or Wave Particles
- **Rock/Metal**: Expanding Rings or Frequency Bars
- **Ambient/Chill**: Wave Particles or Pulsing Sphere

### ⚡ Performance Tips
1. Close other heavy applications for smoothest animation
2. If visualization lags, try lowering sensitivity
3. Use the Reload function (Ctrl+R) if you experience any issues

---

## Troubleshooting

### Common Issues & Solutions

#### 🔴 Problem: Audio file won't load
**Solutions:**
- ✅ Check the file format is supported (see [Supported Formats](#supported-file-formats))
- ✅ Ensure the file isn't corrupted (try playing in another player)
- ✅ Check file permissions (make sure you can access the file)
- ✅ Try copying the file to a different location

#### 🔴 Problem: No sound playing
**Solutions:**
- ✅ Check if the play button is pressed
- ✅ Verify volume slider is not at 0%
- ✅ Check system volume and audio output device
- ✅ Try opening a different audio file

#### 🔴 Problem: Visualization not responding
**Solutions:**
- ✅ Make sure audio is actually playing
- ✅ Increase sensitivity slider
- ✅ Try switching to a different visualization mode
- ✅ Reload the app (Ctrl+R)

#### 🔴 Problem: App running slow/laggy
**Solutions:**
- ✅ Close other resource-intensive applications
- ✅ Lower the sensitivity setting
- ✅ Try a simpler visualization mode (Frequency Bars)
- ✅ Restart the application

#### 🔴 Problem: Controls won't show
**Solutions:**
- ✅ Press the **H** key to toggle controls
- ✅ Move your mouse to wake the interface
- ✅ Exit fullscreen mode (F11) if needed

#### 🔴 Problem: File path error when opening files
**Solutions:**
- ✅ Avoid files in protected system directories
- ✅ Try moving the audio file to your Music or Documents folder
- ✅ Check for special characters in the file path

---

## Advanced Features

### Developer Tools
Access via `Ctrl+Shift+I`:
- View console logs
- Inspect performance metrics
- Debug any issues
- Analyze audio data in real-time

### Custom Window Sizes
- Minimum: 800x600 pixels
- Default: 1400x900 pixels
- Resize freely by dragging window edges
- Use F11 for fullscreen

---

## System Requirements

### Minimum Requirements
- **OS**: Windows 7 or later (64-bit)
- **RAM**: 2 GB
- **Storage**: 200 MB free space
- **Display**: 1280x720 resolution
- **Audio**: Any audio output device

### Recommended Requirements
- **OS**: Windows 10 or later
- **RAM**: 4 GB or more
- **Storage**: 500 MB free space
- **Display**: 1920x1080 or higher
- **Graphics**: Dedicated GPU for best performance

---

## Support & Feedback

### Getting Help
- Review this user manual
- Check the [Troubleshooting](#troubleshooting) section
- Use the built-in Help menu (`Help > Keyboard Shortcuts`)

### Version Information
- **Current Version**: 1.0.0
- **Built with**: Electron 28.0.0, Three.js r128
- **Platform**: Windows (x64)

---

## License & Credits

This application is built with:
- **Electron** - Desktop application framework
- **Three.js** - 3D graphics library
- **Web Audio API** - Audio analysis and processing

Created with ❤️ using modern web technologies.

---

## Quick Reference Card

### Essential Shortcuts
```
Ctrl + O    → Open File
Space       → Play/Pause
H           → Show/Hide Controls
F11         → Fullscreen
Alt + F4    → Exit
```

### Supported Formats
```
✅ M4A, MP3, WAV, FLAC, OGG, AAC
```

### Visualization Modes
```
🎚️ Frequency Bars
🌐 Pulsing Sphere
🌊 Wave Particles
💫 Expanding Rings
```

---

**Enjoy your immersive audio-visual experience! 🎵✨**
