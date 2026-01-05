# Audio Visualizer - M4A to MP4 Converter

A stunning web-based audio visualization tool that transforms M4A audio files into beautiful MP4 videos using mathematical visualizations.

## Features

### 🎨 **9 Mathematical Visualization Styles**
1. **Waveform** - Classic oscilloscope-style waveform display
2. **Circular** - Radial frequency bars emanating from center
3. **Bars** - Traditional frequency spectrum bars
4. **Particles** - Dynamic particle system responding to audio
5. **Spiral** - Mesmerizing spiral pattern based on frequency data
6. **Radial** - Radial burst pattern with gradient effects
7. **Orbital** - Nested circular orbits creating spirograph patterns (inspired by moon-like motions)
8. **Flower** - Cardioid flower patterns with dynamic petals (inspired by orbital ratios)
9. **Galaxy** - Rotating spiral galaxy with star-like particles (inspired by celestial mechanics)

### 🎨 **6 Premium Color Schemes**
- Purple Dream (Gradient 1): #667eea → #764ba2
- Pink Passion (Gradient 2): #f093fb → #f5576c
- Ocean Blue (Gradient 3): #4facfe → #00f2fe
- Mint Fresh (Gradient 4): #43e97b → #38f9d7
- Sunset Glow (Gradient 5): #fa709a → #fee140
- Deep Ocean (Gradient 6): #30cfd0 → #330867

### ⚙️ **Advanced Controls**
- **Smoothing**: Adjust the smoothness of frequency transitions (0.0 - 1.0)
- **Sensitivity**: Control the amplitude response (0.5x - 2.0x)
- Real-time playback controls (Play, Pause, Stop)
- Progress bar with time display

### 📹 **Video Export**
- Export visualizations to WebM format (VP9 codec)
- Automatic audio synchronization
- High-quality 30 FPS recording
- 5 Mbps video bitrate

## Usage

### 1. **Load Audio File**
- Click "Choose Audio File" button
- Select an M4A, MP3, WAV, or OGG file
- File information will be displayed

### 2. **Customize Visualization**
- Select your preferred visualization style
- Choose a color scheme
- Adjust smoothing and sensitivity settings

### 3. **Playback**
- Click "Play" to start audio playback
- Visualization will animate in real-time
- Use "Pause" or "Stop" to control playback

### 4. **Export to Video**
- Click "Export to MP4" button
- The recording will start automatically
- Play your audio to record the visualization
- Video will download when audio finishes

## Technical Details

### Web Audio API
- Uses `AnalyserNode` for frequency analysis
- FFT size: 2048 samples
- Frequency bin count: 1024
- Configurable smoothing time constant

### Canvas Rendering
- High-DPI display support (devicePixelRatio scaling)
- Smooth 60 FPS animations
- Hardware-accelerated rendering
- Gradient effects with glow/shadow

### MediaRecorder API
- Video codec: VP9 (WebM container)
- Frame rate: 30 FPS
- Video bitrate: 5 Mbps
- Audio track synchronization

## Mathematical Visualizations Explained

### Waveform
Displays the raw audio waveform by plotting amplitude values over time. Uses linear interpolation for smooth curves.

### Circular
Maps frequency bins to angles (0-360°) and amplitude to radius, creating a circular frequency spectrum.

### Bars
Traditional frequency spectrum where each bar height represents the amplitude of a specific frequency range.

### Particles
Generates particles positioned based on polar coordinates (angle from frequency, distance from amplitude) with radial gradients.

### Spiral
Creates an Archimedean spiral where:
- Angle = (index / total) × 8π (4 full rotations)
- Radius = (index / total) × maxRadius + amplitude × 50

### Radial
Draws 64 radial lines from center, each representing a frequency bin with length proportional to amplitude.

### Orbital
Creates nested circular orbits with epicycles (small circles orbiting on main orbits), inspired by moon-like orbital motions. Each orbit layer has different rotation speeds, creating mesmerizing spirograph patterns similar to planetary motion.

### Flower
Generates dynamic flower patterns using cardioid equations: r = baseRadius × (1 + amplitude) × (1 - cos(t)). The number of petals (6-12) varies based on average audio amplitude, creating organic, blooming visualizations.

### Galaxy
Simulates a rotating spiral galaxy using logarithmic spirals for the arms. Star-like particles are distributed along 4 spiral arms, with positions calculated using: angle = armAngle + t × π × 4 × spiralTightness. The galaxy slowly rotates over time.

## Browser Compatibility

### Required Features
- Web Audio API
- Canvas API
- MediaRecorder API
- ES6+ JavaScript

### Recommended Browsers
- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14.1+
- ✅ Opera 76+

## File Structure

```
m4atomp4_using_audiovisuals/
├── index.html          # Main HTML structure
├── styles.css          # Premium styling and animations
├── visualizer.js       # Audio visualization engine
└── README.md          # This file
```

## Performance Optimization

### Canvas Optimization
- Uses `devicePixelRatio` for crisp rendering on high-DPI displays
- Efficient path drawing with `beginPath()` and `stroke()`
- Gradient caching where possible

### Audio Processing
- Configurable FFT size for performance tuning
- Smoothing reduces CPU usage by averaging frequency data
- Efficient `Uint8Array` for frequency data

### Memory Management
- Proper cleanup of audio contexts and sources
- Blob URL revocation after downloads
- Canvas clearing between frames

## Known Limitations

1. **Export Format**: Currently exports to WebM (VP9). MP4 export requires server-side conversion using FFmpeg.
2. **Browser Support**: MediaRecorder API support varies by browser.
3. **File Size**: Large audio files may result in large video files.
4. **Real-time Only**: Recording happens in real-time (cannot speed up).

## Future Enhancements

- [ ] Server-side WebM to MP4 conversion
- [ ] Additional visualization types (3D, VU meters, spectrogram)
- [ ] Custom color picker
- [ ] Preset saving/loading
- [ ] Batch processing
- [ ] Resolution selection
- [ ] Background image/video support
- [ ] Text overlay options

## Credits

Created with ❤️ using:
- Web Audio API
- Canvas API
- MediaRecorder API
- Modern CSS3 (Gradients, Animations, Glassmorphism)
- Vanilla JavaScript (ES6+)

## License

This project is open source and available for personal and commercial use.

---

**Enjoy creating stunning audio visualizations! 🎵✨**
