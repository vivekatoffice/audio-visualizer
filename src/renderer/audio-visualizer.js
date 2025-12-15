/* ===================================
   Audio Visualizer with Three.js
   =================================== */

// Global Variables
let scene, camera, renderer;
let visualizerObjects = [];
let audioContext, analyser, audioSource;
let audio;
let isPlaying = false;
let currentVisualization = 'sphere';
let sensitivity = 5;

// Audio Data
let frequencyData;
let bufferLength;

// DOM Elements
const canvas = document.getElementById('visualizerCanvas');
const audioFileInput = document.getElementById('audioFile');
const playBtn = document.getElementById('playBtn');
const progressSlider = document.getElementById('progressSlider');
const progressFill = document.getElementById('progressFill');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const fileNameDisplay = document.getElementById('fileName');
const vizStyleSelect = document.getElementById('vizStyle');
const sensitivitySlider = document.getElementById('sensitivity');
const freqValue = document.getElementById('freqValue');
const bassValue = document.getElementById('bassValue');
const trebleValue = document.getElementById('trebleValue');

// Controls visibility
const contentDiv = document.querySelector('.content');
const controlsHint = document.getElementById('controlsHint');
let controlsVisible = true;
let hideControlsTimer = null;
let mouseMovementTimer = null;

// Axis Speaker Streaming
let axisStreamingEnabled = false;
let currentAudioFilePath = null;

/* ===================================
   Initialization
   =================================== */

function init() {
    // Initialize Three.js Scene  
    initThreeJS();

    // Initialize Audio Context
    audio = new Audio();
    audio.crossOrigin = "anonymous";

    // Event Listeners
    setupEventListeners();

    // Start Animation Loop
    animate();

    // Create initial visualization
    createVisualization('sphere');
}

/* ===================================
   Three.js Setup
   =================================== */

function initThreeJS() {
    // Scene
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 100);

    // Camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.z = 30;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x0a0a0f, 0.5);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8800ff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ===================================
   Event Listeners
   ===================================  */

function setupEventListeners() {
    // File Upload
    audioFileInput.addEventListener('change', handleFileSelect);

    // Play/Pause
    playBtn.addEventListener('click', togglePlayPause);

    // Progress
    progressSlider.addEventListener('input', handleProgressChange);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleAudioEnded);

    // Volume
    volumeSlider.addEventListener('input', handleVolumeChange);

    // Visualization Settings
    vizStyleSelect.addEventListener('change', (e) => {
        currentVisualization = e.target.value;
        createVisualization(currentVisualization);
    });

    sensitivitySlider.addEventListener('input', (e) => {
        sensitivity = parseInt(e.target.value);
    });

    // Electron IPC Listeners (if running in Electron)
    if (window.electron) {
        // Handle file selection from menu
        window.electron.onFileSelected((filePath) => {
            loadAudioFile(filePath);
        });

        // Handle visualization change from menu
        window.electron.onVisualizationChange((type) => {
            currentVisualization = type;
            vizStyleSelect.value = type;
            createVisualization(type);
        });
    }

    // Axis Speaker Streaming Event Listeners
    if (window.electron) {
        // Enable/Disable Axis Streaming
        document.getElementById('enableAxisStream').addEventListener('change', async (e) => {
            axisStreamingEnabled = e.target.checked;
            document.getElementById('axisSettings').style.display = e.target.checked ? 'block' : 'none';

            if (e.target.checked) {
                // Initialize Axis streamer
                const config = {
                    ip: document.getElementById('axisIP').value,
                    username: document.getElementById('axisUsername').value,
                    password: document.getElementById('axisPassword').value
                };

                const result = await window.electron.axisInit(config);
                console.log('[Axis] Initialized:', result);
            }
        });

        // Test Connection Button
        document.getElementById('axisTestBtn').addEventListener('click', async () => {
            const statusEl = document.getElementById('axisStatus');
            statusEl.textContent = '🔄 Testing connection...';
            statusEl.style.display = 'block';
            statusEl.style.background = 'rgba(255,255,255,0.1)';
            statusEl.style.color = '#fff';

            try {
                const result = await window.electron.axisTest();

                if (result.success) {
                    statusEl.textContent = '✅ Connection successful! (Test beep sent)';
                    statusEl.style.background = 'rgba(76, 175, 80, 0.2)';
                    statusEl.style.color = '#4caf50';
                } else {
                    statusEl.textContent = `❌ Failed: ${result.error}`;
                    statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
                    statusEl.style.color = '#f44336';
                }
            } catch (error) {
                statusEl.textContent = `❌ Error: ${error.message}`;
                statusEl.style.background = 'rgba(244, 67, 54, 0.2)';
                statusEl.style.color = '#f44336';
            }
        });
    }

    // Controls Auto-Hide
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);

    // Start hide timer when playing
    audio.addEventListener('play', startHideControlsTimer);
    audio.addEventListener('pause', () => {
        clearHideControlsTimer();
        showControls();
    });
}

/* ===================================
   Controls Visibility
   =================================== */

function handleMouseMove() {
    // Show controls on mouse move
    if (!controlsVisible) {
        showControls();
    }

    // Reset hide timer
    if (isPlaying) {
        startHideControlsTimer();
    }
}

function handleKeyPress(e) {
    // Toggle controls with H key
    if (e.key === 'h' || e.key === 'H') {
        toggleControls();
    }
}

function toggleControls() {
    if (controlsVisible) {
        hideControls();
    } else {
        showControls();
    }
}

function showControls() {
    contentDiv.classList.remove('hide-controls');
    controlsVisible = true;
    controlsHint.classList.remove('show');
}

function hideControls() {
    if (isPlaying) {
        contentDiv.classList.add('hide-controls');
        controlsVisible = false;

        // Show hint briefly
        controlsHint.classList.add('show');
        setTimeout(() => {
            controlsHint.classList.remove('show');
        }, 4000);
    }
}

function startHideControlsTimer() {
    // Clear existing timer
    clearHideControlsTimer();

    // Start new timer (hide after 3 seconds ofafter audio started playing
    hideControlsTimer = setTimeout(() => {
        hideControls();
    }, 3000);
}

function clearHideControlsTimer() {
    if (hideControlsTimer) {
        clearTimeout(hideControlsTimer);
        hideControlsTimer = null;
    }
}

/* ===================================
   Audio File Handling
   =================================== */

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Display file name
    fileNameDisplay.textContent = file.name;

    // Store file path for Axis streaming
    if (file.path) {
        currentAudioFilePath = file.path;
        console.log('[Axis] Audio file path stored:', currentAudioFilePath);
    }

    // Create object URL for the audio file
    const objectURL = URL.createObjectURL(file);
    audio.src = objectURL;

    // Initialize Audio Context if not already done
    if (!audioContext) {
        initAudioContext();
    }

    // Enable controls
    playBtn.disabled = false;
    progressSlider.disabled = false;

    // Auto-play
    setTimeout(() => {
        togglePlayPause();
    }, 300);
}

function loadAudioFile(filePath) {
    // Display file name
    const fileName = filePath.split('\\').pop().split('/').pop();
    fileNameDisplay.textContent = fileName;

    // Set audio source directly (Electron allows file:// protocol)
    audio.src = filePath;

    // Initialize Audio Context if not already done
    if (!audioContext) {
        initAudioContext();
    }

    // Enable controls
    playBtn.disabled = false;
    progressSlider.disabled = false;

    // Auto-play
    setTimeout(() => {
        togglePlayPause();
    }, 300);
}

function initAudioContext() {
    // Create Audio Context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Create Analyser
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.8;

    bufferLength = analyser.frequencyBinCount;
    frequencyData = new Uint8Array(bufferLength);

    // Connect Audio Source
    audioSource = audioContext.createMediaElementSource(audio);
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
}

/* ===================================
   Playback Controls
   =================================== */

function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playBtn.querySelector('.play-icon').style.display = 'block';
        playBtn.querySelector('.pause-icon').style.display = 'none';
    } else {
        audio.play();
        isPlaying = true;
        playBtn.querySelector('.play-icon').style.display = 'none';
        playBtn.querySelector('.pause-icon').style.display = 'block';

        // Resume audio context if suspended
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Stream to Axis speaker if enabled
        if (axisStreamingEnabled && currentAudioFilePath && window.electron) {
            console.log('[Axis] Streaming to speaker:', currentAudioFilePath);
            window.electron.axisStream(currentAudioFilePath)
                .then(result => {
                    if (result.success) {
                        console.log('[Axis] ✅ Streaming successful:', result);
                    } else {
                        console.error('[Axis] ❌ Streaming failed:', result.error);
                    }
                })
                .catch(err => console.error('[Axis] ❌ Stream error:', err));
        }
    }
}

function handleProgressChange(event) {
    const percent = event.target.value;
    const time = (percent / 100) * audio.duration;
    audio.currentTime = time;
}

function updateProgress() {
    if (!audio.duration) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    progressSlider.value = percent;
    progressFill.style.width = percent + '%';

    currentTimeDisplay.textContent = formatTime(audio.currentTime);
}

function updateDuration() {
    durationDisplay.textContent = formatTime(audio.duration);
}

function handleAudioEnded() {
    isPlaying = false;
    playBtn.querySelector('.play-icon').style.display = 'block';
    playBtn.querySelector('.pause-icon').style.display = 'none';
    audio.currentTime = 0;
}

function handleVolumeChange(event) {
    audio.volume = event.target.value / 100;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/* ===================================
   Visualization Creation
   =================================== */

function createVisualization(type) {
    // Clear existing objects
    visualizerObjects.forEach(obj => {
        scene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    visualizerObjects = [];

    // Create new visualization based on type
    switch (type) {
        case 'bars':
            createFrequencyBars();
            break;
        case 'sphere':
            createPulsingSphere();
            break;
        case 'wave':
            createWaveParticles();
            break;
        case 'ring':
            createExpandingRings();
            break;
    }
}

function createFrequencyBars() {
    const barCount = 64;
    const radius = 15;

    for (let i = 0; i < barCount; i++) {
        const geometry = new THREE.BoxGeometry(0.5, 1, 0.5);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / barCount, 1, 0.5),
            emissive: new THREE.Color().setHSL(i / barCount, 1, 0.3),
            shininess: 100
        });

        const bar = new THREE.Mesh(geometry, material);

        const angle = (i / barCount) * Math.PI * 2;
        bar.position.x = Math.cos(angle) * radius;
        bar.position.z = Math.sin(angle) * radius;
        bar.userData.angle = angle;
        bar.userData.baseRadius = radius;
        bar.userData.index = i;

        scene.add(bar);
        visualizerObjects.push(bar);
    }
}

function createPulsingSphere() {
    const geometry = new THREE.IcosahedronGeometry(10, 4);
    const material = new THREE.MeshPhongMaterial({
        color: 0x8800ff,
        emissive: 0x440088,
        shininess: 100,
        wireframe: false,
        flatShading: true
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.userData.originalVertices = geometry.attributes.position.array.slice();
    scene.add(sphere);
    visualizerObjects.push(sphere);

    // Add wireframe
    const wireframeGeometry = new THREE.IcosahedronGeometry(10.1, 4);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff00ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);
    visualizerObjects.push(wireframe);
}

function createWaveParticles() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;

        // Position
        positions[i3] = (Math.random() - 0.5) * 60;
        positions[i3 + 1] = (Math.random() - 0.5) * 60;
        positions[i3 + 2] = (Math.random() - 0.5) * 60;

        // Color
        const color = new THREE.Color().setHSL(Math.random(), 1, 0.6);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    particles.userData.originalPositions = positions.slice();
    scene.add(particles);
    visualizerObjects.push(particles);
}

function createExpandingRings() {
    const ringCount = 5;

    for (let i = 0; i < ringCount; i++) {
        const geometry = new THREE.TorusGeometry(5 + i * 3, 0.2, 16, 100);
        const material = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(i / ringCount, 1, 0.5),
            emissive: new THREE.Color().setHSL(i / ringCount, 1, 0.3),
            shininess: 100,
            transparent: true,
            opacity: 0.7
        });

        const ring = new THREE.Mesh(geometry, material);
        ring.rotation.x = Math.PI / 2;
        ring.userData.baseScale = 1;
        ring.userData.index = i;

        scene.add(ring);
        visualizerObjects.push(ring);
    }
}

/* ===================================
   Visualization Animation
   =================================== */

function updateVisualization() {
    if (!analyser || !isPlaying) return;

    // Get frequency data
    analyser.getByteFrequencyData(frequencyData);

    // Calculate average frequencies for stats
    const bass = getAverageFrequency(0, bufferLength / 8);
    const mid = getAverageFrequency(bufferLength / 8, bufferLength / 2);
    const treble = getAverageFrequency(bufferLength / 2, bufferLength);

    // Update stats display
    freqValue.textContent = Math.round(mid);
    bassValue.textContent = Math.round(bass);
    trebleValue.textContent = Math.round(treble);

    // Update visualization based on type
    switch (currentVisualization) {
        case 'bars':
            updateFrequencyBars();
            break;
        case 'sphere':
            updatePulsingSphere();
            break;
        case 'wave':
            updateWaveParticles();
            break;
        case 'ring':
            updateExpandingRings();
            break;
    }
}

function updateFrequencyBars() {
    visualizerObjects.forEach((bar, index) => {
        const dataIndex = Math.floor((index / visualizerObjects.length) * bufferLength);
        const value = frequencyData[dataIndex] / 255;

        const scale = 1 + value * (sensitivity / 2);
        bar.scale.y = scale;
        bar.position.y = (scale - 1) * 0.5;

        // Update color based on frequency
        const hue = (index / visualizerObjects.length + value * 0.2) % 1;
        bar.material.color.setHSL(hue, 1, 0.5);
        bar.material.emissive.setHSL(hue, 1, 0.3 + value * 0.3);

        // Rotate
        bar.rotation.y += 0.01;
    });
}

function updatePulsingSphere() {
    if (visualizerObjects.length === 0) return;

    const sphere = visualizerObjects[0];
    const wireframe = visualizerObjects[1];

    // Calculate average amplitude
    const avg = getAverageFrequency(0, bufferLength) / 255;

    // Pulse scale
    const scale = 1 + avg * (sensitivity / 5);
    sphere.scale.set(scale, scale, scale);
    wireframe.scale.set(scale, scale, scale);

    // Rotate
    sphere.rotation.x += 0.003 + avg * 0.01;
    sphere.rotation.y += 0.005 + avg * 0.01;
    wireframe.rotation.x += 0.004;
    wireframe.rotation.y += 0.006;

    // Update vertex positions for more dynamic effect
    const positions = sphere.geometry.attributes.position;
    const originalPositions = sphere.userData.originalVertices;

    for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const dataIndex = Math.floor((i / positions.count) * bufferLength);
        const value = frequencyData[dataIndex] / 255;

        const offset = value * (sensitivity / 10);
        positions.array[i3] = originalPositions[i3] * (1 + offset);
        positions.array[i3 + 1] = originalPositions[i3 + 1] * (1 + offset);
        positions.array[i3 + 2] = originalPositions[i3 + 2] * (1 + offset);
    }
    positions.needsUpdate = true;

    // Update color
    const hue = (Date.now() / 10000) % 1;
    sphere.material.color.setHSL(hue, 1, 0.5 + avg * 0.2);
    sphere.material.emissive.setHSL(hue, 1, 0.3 + avg * 0.3);
}

function updateWaveParticles() {
    if (visualizerObjects.length === 0) return;

    const particles = visualizerObjects[0];
    const positions = particles.geometry.attributes.position;
    const originalPositions = particles.userData.originalPositions;

    for (let i = 0; i < positions.count; i++) {
        const i3 = i * 3;
        const dataIndex = Math.floor((i / positions.count) * bufferLength);
        const value = frequencyData[dataIndex] / 255;

        // Create wave effect
        const time = Date.now() / 1000;
        const wave = Math.sin(time + i * 0.01) * value * sensitivity;

        positions.array[i3 + 1] = originalPositions[i3 + 1] + wave * 5;
    }
    positions.needsUpdate = true;

    // Rotate particle system
    particles.rotation.y += 0.002;
}

function updateExpandingRings() {
    visualizerObjects.forEach((ring, index) => {
        const dataIndex = Math.floor((index / visualizerObjects.length) * bufferLength);
        const value = frequencyData[dataIndex] / 255;

        // Pulse scale
        const scale = 1 + value * (sensitivity / 5);
        ring.scale.set(scale, scale, scale);

        // Rotate each ring at different speeds
        ring.rotation.z += 0.005 * (index + 1) + value * 0.02;

        // Update opacity based on frequency
        ring.material.opacity = 0.5 + value * 0.5;

        // Update color
        const hue = (index / visualizerObjects.length + value * 0.3 + Date.now() / 20000) % 1;
        ring.material.color.setHSL(hue, 1, 0.5);
        ring.material.emissive.setHSL(hue, 1, 0.3 + value * 0.3);
    });
}

function getAverageFrequency(start, end) {
    let sum = 0;
    for (let i = start; i < end; i++) {
        sum += frequencyData[i];
    }
    return sum / (end - start);
}

/* ===================================
   Animation Loop
   =================================== */

function animate() {
    requestAnimationFrame(animate);

    // Update visualization
    updateVisualization();

    // Render scene
    renderer.render(scene, camera);
}

/* ===================================
   Initialize on Load
   =================================== */

window.addEventListener('DOMContentLoaded', init);
