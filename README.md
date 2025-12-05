# 3D Audio Visualizer

A stunning, immersive audio visualizer built with Three.js and the Web Audio API.

## Features

### 🎵 Audio Playback
- Support for .m4a and other audio formats
- Full playback controls (play, pause, seek)
- Volume control
- Real-time progress tracking

### 🎨 Visualization Modes
1. **Frequency Bars** - Classic circular frequency bars with color gradients
2. **Pulsing Sphere** - Dynamic 3D sphere that pulses and morphs with the music
3. **Wave Particles** - 2000 particles creating beautiful wave patterns
4. **Expanding Rings** - Concentric rings that pulse and rotate

### ✨ Premium Design
- Glassmorphism UI with backdrop blur
- Vibrant purple and pink gradient accents
- Smooth animations and transitions
- Responsive design for all screen sizes
- Dark theme optimized for viewing

### 📊 Real-time Stats
- Frequency level monitoring
- Bass level tracking
- Treble level analysis

### ⚙️ Customization
- Adjustable sensitivity (1-10)
- Switch between visualization styles
- Volume control

## How to Use

1. Open `audio-visualizer.html` in a modern web browser
2. Click "Choose Audio File" and select an .m4a or other audio file
3. The audio will auto-play with the default "Pulsing Sphere" visualization
4. Customize the experience:
   - Change visualization style from the dropdown
   - Adjust sensitivity with the slider
   - Control volume with the volume slider
5. Use the play/pause button and progress bar to control playback

## Technical Details

### Technologies Used
- **HTML5** - Structure and semantic markup
- **CSS3** - Modern styling with custom properties, gradients, and animations
- **JavaScript (ES6+)** - Application logic
- **Three.js** - 3D rendering and visualization
- **Web Audio API** - Audio analysis and frequency data

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance
- Hardware-accelerated 3D rendering
- Optimized particle systems
- Efficient frequency analysis
- 60 FPS animation

## File Structure

```
audio-visualizer/
├── audio-visualizer.html    # Main HTML file
├── audio-visualizer.css     # Styling and design system
└── audio-visualizer.js      # Application logic and visualizations
```

## Customization Guide

### Changing Colors
Edit the CSS variables in `audio-visualizer.css`:
```css
:root {
    --color-accent-purple: hsl(280, 85%, 60%);
    --color-accent-blue: hsl(220, 85%, 60%);
    --color-accent-pink: hsl(320, 85%, 55%);
}
```

### Adding New Visualizations
1. Create a new function in `audio-visualizer.js`:
```javascript
function createMyVisualization() {
    // Your Three.js objects here
}
```

2. Add the update function:
```javascript
function updateMyVisualization() {
    // Animation logic here
}
```

3. Add the option to the HTML select element

### Adjusting FFT Size
In `audio-visualizer.js`, modify:
```javascript
analyser.fftSize = 512; // Change to 256, 1024, 2048, etc.
```

## Tips for Best Experience

1. **Use high-quality audio files** for better frequency analysis
2. **Adjust sensitivity** based on the music genre:
   - Lower (1-3) for classical/ambient
   - Medium (4-6) for pop/rock
   - Higher (7-10) for EDM/bass-heavy music
3. **Try different visualizations** - each one responds differently to various frequencies
4. **Full-screen mode** for the most immersive experience

## Known Limitations

- Audio Context may require user interaction to start (browser security)
- Some browsers may not support all audio formats
- Performance may vary on older hardware

## Credits

Created with ❤️ using modern web technologies.

## License

Feel free to use and modify for your projects!
