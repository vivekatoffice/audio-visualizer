/* ===================================
   Audio Visualizer with Three.js
   =================================== */

import * as THREE from 'three';
import { STLLoader } from './STLLoader.js';
import { OrbitControls } from './OrbitControls.js';

// Global Variables
let scene, camera, renderer, controls;
let visualizerObjects = [];
let audioContext, analyser, audioSource;
let audio;
let isPlaying = false;
let currentVisualization = 'sphere';
let sensitivity = 5;

// STL State
let stlMesh = null;
let stlMode = 'solid'; // solid, wireframe, angle
let stlColor = '#4aa3ff';
let stlAutoRotate = false;
const stlLoader = new STLLoader();

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
const exportBtn = document.getElementById('exportBtn');
const exportStatus = document.getElementById('exportStatus');

// Recording State
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// STL DOM Elements
const stlControls = document.getElementById('stlControls');
const stlFileInput = document.getElementById('stlFileInput');
const btnSolid = document.getElementById('btnSolid');
const btnWireframe = document.getElementById('btnWireframe');
const btnAngle = document.getElementById('btnAngle');
const btnAutoRotate = document.getElementById('btnAutoRotate');
const colorPicker = document.getElementById('colorPicker');
const colorContainer = document.getElementById('colorContainer');

// Controls visibility
const contentDiv = document.querySelector('.content');
const controlsHint = document.getElementById('controlsHint');
let controlsVisible = true;
let hideControlsTimer = null;

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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 2.0;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x8800ff, 1, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0088ff, 1, 100);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

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

    // Export Video
    exportBtn.addEventListener('click', exportToVideo);

    // Volume
    volumeSlider.addEventListener('input', handleVolumeChange);

    // Visualization Settings
    vizStyleSelect.addEventListener('change', (e) => {
        currentVisualization = e.target.value;

        // Show/Hide STL controls
        if (currentVisualization === 'stl') {
            stlControls.style.display = 'block';
        } else {
            stlControls.style.display = 'none';
        }

        createVisualization(currentVisualization);
    });

    sensitivitySlider.addEventListener('input', (e) => {
        sensitivity = parseInt(e.target.value);
    });

    // STL Controls
    stlFileInput.addEventListener('change', handleSTLFileSelect);

    btnSolid.addEventListener('click', () => {
        stlMode = 'solid';
        updateSTLModeButtons();
        updateSTLMaterial();
    });

    btnWireframe.addEventListener('click', () => {
        stlMode = 'wireframe';
        updateSTLModeButtons();
        updateSTLMaterial();
    });

    btnAngle.addEventListener('click', () => {
        stlMode = 'angle';
        updateSTLModeButtons();
        updateSTLMaterial();
    });

    colorPicker.addEventListener('input', (e) => {
        stlColor = e.target.value;
        updateSTLMaterial();
    });

    btnAutoRotate.addEventListener('click', () => {
        stlAutoRotate = !stlAutoRotate;
        controls.autoRotate = stlAutoRotate;
        btnAutoRotate.textContent = stlAutoRotate ? 'Stop Auto Rotation' : 'Start Auto Rotation';
        btnAutoRotate.style.background = stlAutoRotate ? 'rgba(74, 163, 255, 0.3)' : '';
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
            if (type === 'stl') stlControls.style.display = 'block';
            else stlControls.style.display = 'none';
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
    exportBtn.disabled = false;

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
    exportBtn.disabled = false;

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

    // Create an intermediate gain node (so it can be recorded without being audible if we wanted, etc.)
    // But for normal play out loud, we must connect to audioContext.destination
    audioSource.connect(analyser);
    analyser.connect(audioContext.destination);
}

/* ===================================
   Video Export Handling
   =================================== */

async function exportToVideo() {
    if (isRecording) return; // Prevent multiple clicks

    exportStatus.textContent = 'Checking browser support...';
    exportStatus.style.color = '#4aa3ff';

    try {
        // Find best codec
        let mimeType = '';
        const codecs = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus',
            'video/mp4',
            'video/webm'
        ];

        for (const codec of codecs) {
            if (MediaRecorder.isTypeSupported(codec)) {
                mimeType = codec;
                console.log('Using codec:', codec);
                break;
            }
        }

        if (!mimeType) {
            throw new Error('No supported video codec found in your browser');
        }

        // 1) Capture Video from Three.js Canvas (60fps)
        const canvasStream = canvas.captureStream(60);

        // 2) Capture Audio from Web Audio Context
        const combinedStream = new MediaStream();

        // Add Video Track
        canvasStream.getVideoTracks().forEach(track => {
            combinedStream.addTrack(track);
        });

        // Add Audio Track via a MediaStreamDestination
        const audioDestination = audioContext.createMediaStreamDestination();
        audioSource.connect(audioDestination);

        audioDestination.stream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
        });

        exportStatus.textContent = 'Preparing recorder...';

        const options = {
            mimeType: mimeType,
            videoBitsPerSecond: 5000000 // 5 Mbps
        };

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(combinedStream, options);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            exportStatus.textContent = `Recording error: ${event.error?.message || 'Unknown error'}`;
            exportStatus.style.color = '#f44336';
            isRecording = false;
            exportBtn.disabled = false;
        };

        mediaRecorder.onstop = () => {
            console.log('Recording stopped. Total chunks:', recordedChunks.length);
            isRecording = false;
            exportBtn.disabled = false;

            if (recordedChunks.length === 0) {
                exportStatus.textContent = 'No data recorded. Please try again.';
                exportStatus.style.color = '#f44336';
                return;
            }

            const blob = new Blob(recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            a.download = `audio_visualization_${Date.now()}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            exportStatus.textContent = `✓ Export completed! ${(blob.size / 1024 / 1024).toFixed(2)} MB`;
            exportStatus.style.color = '#4caf50';

            setTimeout(() => {
                exportStatus.textContent = '';
            }, 5000);
        };

        // Start recording
        mediaRecorder.start(100); // chunk every 100ms
        isRecording = true;
        exportBtn.disabled = true;

        exportStatus.textContent = '🔴 Recording... ';
        exportStatus.style.color = '#f44336';

        // Start the song from the beginning if we aren't already playing or at the start
        audio.currentTime = 0;
        if (!isPlaying) {
            togglePlayPause();
        }

    } catch (err) {
        console.error('Export failed:', err);
        exportStatus.textContent = `Export failed: ${err.message}`;
        exportStatus.style.color = '#f44336';
    }
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

    if (isRecording && mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        exportStatus.textContent = 'Processing video...';
        exportStatus.style.color = '#4aa3ff';
    }
}

function handleVolumeChange(event) {
    audio.volume = event.target.value / 100;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')} `;
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

    // Reset camera position
    camera.position.set(0, 0, 30);
    camera.lookAt(0, 0, 0);

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
        case 'shader':
            createShaderVisualizer();
            break;
        case 'stl':
            createSTLVisualization();
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
   Shader Visualization
   =================================== */

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
            void main() {
                vUv = uv;
                vPosition = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
            `;

const fragmentShader = `
uniform float time;
uniform float bass;
uniform float mid;
uniform float treble;
uniform vec3 baseColor;
varying vec2 vUv;
varying vec3 vPosition;

            void main() {
    // Generate some basic noise based on position and time
    float noise = fract(sin(dot(vPosition.xyz, vec3(12.9898, 78.233, 123.456)) + time * 0.5) * 43758.5453);

    // Create organic glowing effect based on UV
    float glow = abs(sin(vUv.y * 20.0 + time * 3.0 + noise * 0.5));

    // Mix the frequency data into the color
    vec3 color = baseColor;
                color.r += bass * 0.5 * glow;
                color.g += mid * 0.5 * glow;
                color.b += treble * 0.5 * glow;

    // Add pulsing brightness based on overall frequency activity
    float intensity = (bass + mid + treble) / 3.0;
                color *= (0.5 + intensity * 1.5);

                gl_FragColor = vec4(color, 1.0);
            }
            `;

function createShaderVisualizer() {
    const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

    const uniforms = {
        time: { value: 0.0 },
        bass: { value: 0.0 },
        mid: { value: 0.0 },
        treble: { value: 0.0 },
        baseColor: { value: new THREE.Color(0x8800ff) }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        wireframe: false,
        transparent: true,
        opacity: 0.9,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    visualizerObjects.push(mesh);
}

/* ===================================
   STL Visualization
   =================================== */

function handleSTLFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            const geometry = stlLoader.parse(event.target.result);
            setupSTLMesh(geometry);
        } catch (err) {
            console.error(err);
            alert('Error parsing STL file');
        }
    };
    reader.readAsArrayBuffer(file);
}

function createSTLVisualization() {
    // Try to load default model if no mesh exists
    if (!stlMesh) {
        stlLoader.load('./model.stl', function (geometry) {
            setupSTLMesh(geometry);
        }, undefined, function (error) {
            console.log('No default model found');
        });
    } else {
        // Re-add existing mesh
        scene.add(stlMesh);
        visualizerObjects.push(stlMesh);

        // Adjust camera
        camera.position.set(100, 100, 100);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
    }

    // Update UI buttons
    updateSTLModeButtons();
}

function setupSTLMesh(geometry) {
    // Clear existing
    if (stlMesh) {
        scene.remove(stlMesh);
        if (stlMesh.geometry) stlMesh.geometry.dispose();
        if (stlMesh.material) stlMesh.material.dispose();
        // Remove from visualizerObjects if present
        const index = visualizerObjects.indexOf(stlMesh);
        if (index > -1) visualizerObjects.splice(index, 1);
    }

    const material = getSTLMaterial();
    stlMesh = new THREE.Mesh(geometry, material);

    // Center & Scale
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);

    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
        const targetSize = 50; // Smaller than viewer to fit visualizer scene
        stlMesh.scale.setScalar(targetSize / maxDim);
    }

    // Store original scale for audio reactivity
    stlMesh.userData.baseScale = stlMesh.scale.x;

    stlMesh.castShadow = true;
    stlMesh.receiveShadow = true;

    scene.add(stlMesh);
    visualizerObjects.push(stlMesh);

    // Adjust camera
    camera.position.set(60, 60, 60);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
}

function getSTLMaterial() {
    switch (stlMode) {
        case 'wireframe':
            return new THREE.MeshStandardMaterial({
                color: stlColor,
                roughness: 0.5,
                metalness: 0.1,
                wireframe: true
            });
        case 'angle':
            return new THREE.MeshNormalMaterial();
        case 'solid':
        default:
            return new THREE.MeshStandardMaterial({
                color: stlColor,
                roughness: 0.5,
                metalness: 0.1,
                side: THREE.DoubleSide
            });
    }
}

function updateSTLMaterial() {
    if (!stlMesh) return;
    const newMaterial = getSTLMaterial();
    stlMesh.material.dispose();
    stlMesh.material = newMaterial;
}

function updateSTLModeButtons() {
    btnSolid.style.background = stlMode === 'solid' ? 'rgba(74, 163, 255, 0.3)' : '';
    btnWireframe.style.background = stlMode === 'wireframe' ? 'rgba(74, 163, 255, 0.3)' : '';
    btnAngle.style.background = stlMode === 'angle' ? 'rgba(74, 163, 255, 0.3)' : '';

    if (stlMode === 'angle') {
        colorContainer.style.opacity = '0.3';
        colorContainer.style.pointerEvents = 'none';
    } else {
        colorContainer.style.opacity = '1';
        colorContainer.style.pointerEvents = 'auto';
    }
}

function updateSTLVisualization() {
    if (!stlMesh || !analyser) return;

    // Get average frequency for reactivity
    const avg = getAverageFrequency(0, bufferLength) / 255;
    const bass = getAverageFrequency(0, bufferLength / 8) / 255;

    // Pulse scale based on bass
    const baseScale = stlMesh.userData.baseScale || 1;
    const scale = baseScale * (1 + bass * (sensitivity / 5));
    stlMesh.scale.set(scale, scale, scale);

    // Rotate slightly based on overall volume
    if (!controls.autoRotate) {
        stlMesh.rotation.y += 0.002 + avg * 0.01;
        stlMesh.rotation.x += Math.sin(Date.now() * 0.001) * 0.002;
    }

    // Color shift if in solid/wireframe mode
    if (stlMode !== 'angle') {
        const material = stlMesh.material;
        // Mix base color with emissive pulse
        const hue = (Date.now() / 10000) % 1;
        material.emissive = new THREE.Color().setHSL(hue, 1, 0.2 * avg);
    }
}

/* ===================================
   Animation Animation
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
        case 'shader':
            updateShaderVisualizer();
            break;
        case 'stl':
            updateSTLVisualization();
            break;
    }

    // Update controls
    if (controls) controls.update();
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

function updateShaderVisualizer() {
    if (visualizerObjects.length === 0) return;

    const mesh = visualizerObjects[0];
    const material = mesh.material;

    // Get average frequencies
    const bass = getAverageFrequency(0, bufferLength / 8) / 255;
    const mid = getAverageFrequency(bufferLength / 8, bufferLength / 2) / 255;
    const treble = getAverageFrequency(bufferLength / 2, bufferLength) / 255;

    // Update Uniforms
    material.uniforms.time.value = Date.now() * 0.001;
    material.uniforms.bass.value = bass * (sensitivity / 5);
    material.uniforms.mid.value = mid * (sensitivity / 5);
    material.uniforms.treble.value = treble * (sensitivity / 5);

    // Morph scale based on bass
    const scale = 1 + bass * (sensitivity / 10);
    mesh.scale.set(scale, scale, scale);

    // Dynamic Rotation
    mesh.rotation.x += 0.005 + bass * 0.01;
    mesh.rotation.y += 0.005 + mid * 0.01;
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
