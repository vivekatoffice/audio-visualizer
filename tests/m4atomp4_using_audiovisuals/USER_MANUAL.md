# User Manual - Audio Visualizer Studio

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Interface Overview](#interface-overview)
4. [Step-by-Step Guide](#step-by-step-guide)
5. [Visualization Types](#visualization-types)
6. [Settings & Controls](#settings--controls)
7. [Exporting Videos](#exporting-videos)
8. [Troubleshooting](#troubleshooting)
9. [Tips & Best Practices](#tips--best-practices)

---

## Introduction

**Audio Visualizer Studio** is a powerful web-based tool that transforms your audio files into stunning visual animations. Using advanced mathematical algorithms and the Web Audio API, it creates real-time visualizations synchronized with your music.

### Key Features
- ✨ 6 unique visualization styles
- 🎨 6 premium color schemes
- ⚙️ Adjustable smoothing and sensitivity
- 📹 Export to video (WebM/MP4)
- 🎵 Support for M4A, MP3, WAV, OGG formats

---

## Getting Started

### System Requirements
- **Browser**: Chrome 90+, Edge 90+, Firefox 88+, Safari 14.1+
- **RAM**: 4GB minimum (8GB recommended)
- **Storage**: Sufficient space for exported videos

### Opening the Application
1. Navigate to the project folder
2. Open `index.html` in a modern web browser
3. Or use a local server: `npx serve -l 3000`

---

## Interface Overview

### Header Section
- **Logo & Title**: "Audio Visualizer Studio"
- **Subtitle**: Brief description of the tool

### Left Panel - Controls
1. **File Upload**: Choose your audio file
2. **Visualization Styles**: 6 different visualization types
3. **Color Schemes**: 6 gradient color options
4. **Settings**: Smoothing and Sensitivity sliders
5. **Playback Controls**: Play, Pause, Stop buttons
6. **Export Button**: Generate MP4/WebM video

### Right Panel - Visualization Canvas
- **Large Canvas**: Real-time visualization display
- **Progress Bar**: Shows playback progress
- **Time Display**: Current time / Total duration

---

## Step-by-Step Guide

### 1. Load an Audio File

**Method 1: Click Upload Button**
```
1. Click "Choose Audio File" button
2. Browse to your audio file
3. Select M4A, MP3, WAV, or OGG file
4. Click "Open"
```

**Method 2: Drag & Drop** *(if supported)*
```
1. Drag audio file from file explorer
2. Drop onto the upload area
```

**Result**: File name and size will be displayed below the button.

---

### 2. Select Visualization Style

Click on one of the 6 visualization types:

#### 🌊 Waveform
Classic oscilloscope-style waveform display. Shows the raw audio amplitude over time.

**Best for**: Podcasts, vocals, acoustic music

#### ⭕ Circular
Radial frequency bars emanating from the center in a circular pattern.

**Best for**: Electronic music, bass-heavy tracks

#### 📊 Bars
Traditional frequency spectrum bars arranged horizontally.

**Best for**: All music types, classic visualization

#### ✨ Particles
Dynamic particle system that responds to audio frequencies.

**Best for**: Ambient music, chill tracks

#### 🌀 Spiral
Mesmerizing spiral pattern based on frequency data.

**Best for**: Progressive music, trance

#### 💫 Radial
Radial burst pattern with gradient effects from center.

**Best for**: Energetic music, EDM

---

### 3. Choose a Color Scheme

Select from 6 premium gradient color schemes:

1. **Purple Dream** - Professional, elegant
2. **Pink Passion** - Vibrant, energetic
3. **Ocean Blue** - Cool, calming
4. **Mint Fresh** - Fresh, modern
5. **Sunset Glow** - Warm, inviting
6. **Deep Ocean** - Dark, mysterious

**Tip**: Color schemes work differently with each visualization type. Experiment to find your favorite combination!

---

### 4. Adjust Settings

#### Smoothing (0.0 - 1.0)
Controls how smooth the frequency transitions are.

- **Low (0.0 - 0.3)**: Sharp, reactive, jittery
- **Medium (0.4 - 0.7)**: Balanced response
- **High (0.8 - 1.0)**: Smooth, flowing, less reactive

**Recommended**: 0.8 for most music

#### Sensitivity (0.5x - 2.0x)
Controls the amplitude response of the visualization.

- **Low (0.5x - 0.8x)**: Subtle movements
- **Normal (0.9x - 1.1x)**: Standard response
- **High (1.2x - 2.0x)**: Exaggerated movements

**Recommended**: 1.0 for balanced visuals

---

### 5. Playback Controls

#### ▶️ Play Button
- Starts audio playback
- Begins visualization animation
- Disabled when playing

#### ⏸️ Pause Button
- Pauses audio and visualization
- Maintains current position
- Enabled only when playing

#### ⏹️ Stop Button
- Stops playback
- Resets to beginning
- Clears visualization canvas

---

## Exporting Videos

### Export Process

1. **Load Audio File** (if not already loaded)
2. **Configure Visualization** (style, colors, settings)
3. **Click "Export to MP4"** button
4. **Wait for Recording** to complete
   - Audio will play automatically
   - Recording indicator shows "🔴 Recording..."
   - Export stops when audio ends
5. **Download Automatically** starts when complete

### Export Specifications

| Property | Value |
|----------|-------|
| Format | WebM (VP9/VP8) or MP4 |
| Frame Rate | 30 FPS |
| Video Bitrate | 2.5 Mbps |
| Resolution | Canvas size (responsive) |
| Audio | Original quality |

### File Naming
Exported files are named: `audio_visualization_[timestamp].webm`

Example: `audio_visualization_1704461234567.webm`

---

## Troubleshooting

### Problem: "Export failed. Please try again."

**Possible Causes:**
1. Browser doesn't support MediaRecorder API
2. Insufficient memory
3. Audio file not properly loaded

**Solutions:**
```
✓ Use Chrome, Edge, or Firefox (latest version)
✓ Close other browser tabs
✓ Reload the page and try again
✓ Try a smaller audio file
✓ Check browser console for errors (F12)
```

---

### Problem: No visualization appears

**Possible Causes:**
1. Audio file not loaded
2. Canvas not rendering
3. Browser compatibility issue

**Solutions:**
```
✓ Ensure audio file is loaded (check file info)
✓ Click "Play" button
✓ Refresh the page
✓ Try a different browser
✓ Check if audio is playing (listen for sound)
```

---

### Problem: Visualization is too sensitive/not sensitive enough

**Solution:**
```
✓ Adjust "Sensitivity" slider
✓ Lower values = less movement
✓ Higher values = more movement
✓ Try values between 0.8 - 1.5 for best results
```

---

### Problem: Visualization is jittery

**Solution:**
```
✓ Increase "Smoothing" slider to 0.8 or higher
✓ Higher smoothing = smoother transitions
✓ May reduce reactivity slightly
```

---

### Problem: Export file size is too large

**Explanation:**
Video file size depends on:
- Audio duration (longer = larger)
- Video bitrate (2.5 Mbps)
- Resolution (canvas size)

**Solutions:**
```
✓ Use shorter audio clips
✓ Reduce browser window size before exporting
✓ Consider compressing the exported video with external tools
```

---

## Tips & Best Practices

### For Best Visual Results

1. **Match Visualization to Music Genre**
   - Electronic/EDM → Circular, Radial, Particles
   - Rock/Pop → Bars, Waveform
   - Ambient/Chill → Spiral, Particles

2. **Color Selection**
   - Energetic music → Bright colors (Pink, Mint, Sunset)
   - Calm music → Cool colors (Ocean, Deep Ocean)
   - Professional → Purple Dream

3. **Settings Optimization**
   - Fast-paced music → Lower smoothing (0.6-0.7)
   - Slow music → Higher smoothing (0.8-0.9)
   - Bass-heavy → Higher sensitivity (1.2-1.5)

### For Best Export Results

1. **Before Exporting**
   ```
   ✓ Test visualization with playback first
   ✓ Adjust settings to your liking
   ✓ Close unnecessary browser tabs
   ✓ Ensure stable system performance
   ```

2. **During Export**
   ```
   ✓ Don't switch browser tabs
   ✓ Don't minimize the window
   ✓ Let the audio play completely
   ✓ Wait for "Export completed" message
   ```

3. **After Export**
   ```
   ✓ Check the downloaded file
   ✓ Verify video plays correctly
   ✓ Check audio synchronization
   ```

### Performance Tips

1. **For Smooth Playback**
   - Close other applications
   - Use a modern browser
   - Ensure good CPU/GPU performance

2. **For Faster Exports**
   - Reduce canvas size (resize browser window)
   - Use shorter audio clips
   - Close background applications

### Creative Tips

1. **Experiment with Combinations**
   - Try each visualization with each color scheme
   - Test different sensitivity levels
   - Create variations of the same song

2. **Create Series**
   - Use consistent colors for an album
   - Match visualization to song mood
   - Create themed collections

3. **Professional Use**
   - Use for social media content
   - Create YouTube video backgrounds
   - Generate podcast visualizations
   - Design presentation backgrounds

---

## Keyboard Shortcuts

Currently, the application uses mouse/touch controls only. Future versions may include:

- `Space` - Play/Pause
- `S` - Stop
- `E` - Export
- `1-6` - Select visualization type
- `←/→` - Seek backward/forward

---

## Browser Compatibility

### Fully Supported ✅
- Chrome 90+
- Edge 90+
- Firefox 88+
- Opera 76+

### Partially Supported ⚠️
- Safari 14.1+ (limited codec support)

### Not Supported ❌
- Internet Explorer (all versions)
- Older browser versions

---

## File Format Support

### Audio Input Formats
- ✅ M4A (AAC)
- ✅ MP3
- ✅ WAV
- ✅ OGG
- ✅ FLAC (browser-dependent)

### Video Output Formats
- ✅ WebM (VP9 codec) - Primary
- ✅ WebM (VP8 codec) - Fallback
- ⚠️ MP4 - Browser-dependent

---

## Privacy & Security

### Data Handling
- ✅ All processing happens locally in your browser
- ✅ No files are uploaded to any server
- ✅ No data is collected or stored
- ✅ Completely offline-capable (after initial load)

### Permissions Required
- 🎵 Audio playback (automatic)
- 📹 Canvas capture (for export)
- 💾 File download (for export)

---

## Support & Feedback

### Getting Help
1. Check this manual first
2. Review the [Troubleshooting](#troubleshooting) section
3. Check browser console for errors (F12)
4. Try with a different audio file
5. Test in a different browser

### Reporting Issues
When reporting problems, include:
- Browser name and version
- Operating system
- Audio file format and size
- Steps to reproduce the issue
- Error messages (if any)

---

## Version Information

**Current Version**: 1.0.0  
**Last Updated**: January 2026  
**Compatibility**: Modern browsers with Web Audio API support

---

**Enjoy creating stunning audio visualizations! 🎵✨**
