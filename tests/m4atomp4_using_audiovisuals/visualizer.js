// Audio Visualizer with Mathematical Visualizations
class AudioVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizer');
        this.ctx = this.canvas.getContext('2d');
        this.audioContext = null;
        this.analyser = null;
        this.audioSource = null;
        this.audioElement = null;
        this.dataArray = null;
        this.bufferLength = 0;
        this.animationId = null;

        // Settings
        this.vizType = 'waveform';
        this.colorScheme = 'gradient1';
        this.smoothing = 0.8;
        this.sensitivity = 1.0;
        this.isPlaying = false;

        // Aspect Ratio
        this.aspectRatio = '9:16'; // Default for mobile/shorts
        this.aspectWidth = 1080;
        this.aspectHeight = 1920;

        // Recording
        this.mediaRecorder = null;
        this.recordedChunks = [];

        this.init();
        this.setupEventListeners();
        this.resizeCanvas();
    }

    init() {
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.width = rect.width;
        this.height = rect.height;
    }

    setupEventListeners() {
        // File upload
        document.getElementById('uploadBtn').addEventListener('click', () => {
            document.getElementById('audioInput').click();
        });

        document.getElementById('audioInput').addEventListener('change', (e) => {
            this.loadAudioFile(e.target.files[0]);
        });

        // Visualization type
        document.querySelectorAll('.viz-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.viz-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.vizType = btn.dataset.viz;
            });
        });

        // Color scheme
        document.querySelectorAll('.color-scheme').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.color-scheme').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.colorScheme = btn.dataset.scheme;
            });
        });

        // Settings
        document.getElementById('smoothing').addEventListener('input', (e) => {
            this.smoothing = parseFloat(e.target.value);
            document.getElementById('smoothingValue').textContent = this.smoothing.toFixed(1);
            if (this.analyser) {
                this.analyser.smoothingTimeConstant = this.smoothing;
            }
        });

        document.getElementById('sensitivity').addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            document.getElementById('sensitivityValue').textContent = this.sensitivity.toFixed(1);
        });

        // Playback controls
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());

        // Export
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToMP4());
    }

    async loadAudioFile(file) {
        if (!file) return;

        const fileInfo = document.getElementById('fileInfo');
        fileInfo.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;

        // Create audio element
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }

        this.audioElement = new Audio();
        this.audioElement.src = URL.createObjectURL(file);

        // Setup audio context
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Create analyser
        if (!this.analyser) {
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.smoothingTimeConstant = this.smoothing;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
        }

        // Connect audio source
        if (this.audioSource) {
            this.audioSource.disconnect();
        }
        this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
        this.audioSource.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);

        // Update duration
        this.audioElement.addEventListener('loadedmetadata', () => {
            document.getElementById('duration').textContent = this.formatTime(this.audioElement.duration);
        });

        // Update current time
        this.audioElement.addEventListener('timeupdate', () => {
            document.getElementById('currentTime').textContent = this.formatTime(this.audioElement.currentTime);
            const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
        });

        // Enable controls
        document.getElementById('playBtn').disabled = false;
        document.getElementById('exportBtn').disabled = false;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    play() {
        if (!this.audioElement) return;

        this.audioElement.play();
        this.isPlaying = true;
        this.animate();

        document.getElementById('playBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        document.getElementById('stopBtn').disabled = false;
    }

    pause() {
        if (!this.audioElement) return;

        this.audioElement.pause();
        this.isPlaying = false;

        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    stop() {
        if (!this.audioElement) return;

        this.audioElement.pause();
        this.audioElement.currentTime = 0;
        this.isPlaying = false;

        document.getElementById('playBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;

        this.clearCanvas();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    animate() {
        if (!this.isPlaying) return;

        this.animationId = requestAnimationFrame(() => this.animate());

        this.analyser.getByteFrequencyData(this.dataArray);

        // Clear canvas
        this.clearCanvas();

        // Draw visualization based on type
        switch (this.vizType) {
            case 'waveform':
                this.drawWaveform();
                break;
            case 'circular':
                this.drawCircular();
                break;
            case 'bars':
                this.drawBars();
                break;
            case 'particles':
                this.drawParticles();
                break;
            case 'spiral':
                this.drawSpiral();
                break;
            case 'radial':
                this.drawRadial();
                break;
            case 'orbital':
                this.drawOrbital();
                break;
            case 'flower':
                this.drawFlower();
                break;
            case 'galaxy':
                this.drawGalaxy();
                break;
        }
    }

    getGradient(x1, y1, x2, y2) {
        const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
        const schemes = {
            gradient1: ['#667eea', '#764ba2'],
            gradient2: ['#f093fb', '#f5576c'],
            gradient3: ['#4facfe', '#00f2fe'],
            gradient4: ['#43e97b', '#38f9d7'],
            gradient5: ['#fa709a', '#fee140'],
            gradient6: ['#30cfd0', '#330867']
        };
        const colors = schemes[this.colorScheme];
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        return gradient;
    }

    drawWaveform() {
        const centerY = this.height / 2;
        const sliceWidth = this.width / this.bufferLength;

        this.ctx.lineWidth = 3;
        this.ctx.strokeStyle = this.getGradient(0, 0, this.width, 0);
        this.ctx.beginPath();

        let x = 0;
        for (let i = 0; i < this.bufferLength; i++) {
            const v = (this.dataArray[i] / 255.0) * this.sensitivity;
            const y = centerY + (v - 0.5) * this.height;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        this.ctx.stroke();

        // Add glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = this.getGradient(0, 0, this.width, 0);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawCircular() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;

        this.ctx.lineWidth = 2;

        for (let i = 0; i < this.bufferLength; i++) {
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const amplitude = (this.dataArray[i] / 255.0) * this.sensitivity * 100;

            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + amplitude);
            const y2 = centerY + Math.sin(angle) * (radius + amplitude);

            const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            this.ctx.strokeStyle = gradient;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    drawBars() {
        const barWidth = this.width / this.bufferLength * 2.5;
        let x = 0;

        for (let i = 0; i < this.bufferLength; i++) {
            const barHeight = (this.dataArray[i] / 255.0) * this.height * this.sensitivity;

            const gradient = this.ctx.createLinearGradient(0, this.height - barHeight, 0, this.height);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    }

    drawParticles() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        for (let i = 0; i < this.bufferLength; i += 4) {
            const amplitude = (this.dataArray[i] / 255.0) * this.sensitivity;
            const angle = (i / this.bufferLength) * Math.PI * 2;
            const distance = amplitude * Math.min(this.width, this.height) / 2;

            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            const size = amplitude * 10;

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, 'transparent');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawSpiral() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 2;

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = this.getGradient(0, 0, this.width, this.height);
        this.ctx.beginPath();

        for (let i = 0; i < this.bufferLength; i++) {
            const angle = (i / this.bufferLength) * Math.PI * 8;
            const amplitude = (this.dataArray[i] / 255.0) * this.sensitivity;
            const radius = (i / this.bufferLength) * maxRadius + amplitude * 50;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }

        this.ctx.stroke();

        // Add glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.getGradient(0, 0, this.width, this.height);
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawRadial() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const segments = 64;

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const dataIndex = Math.floor((i / segments) * this.bufferLength);
            const amplitude = (this.dataArray[dataIndex] / 255.0) * this.sensitivity;
            const radius = amplitude * Math.min(this.width, this.height) / 2;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const gradient = this.ctx.createLinearGradient(centerX, centerY, x, y);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0] + '80');
            gradient.addColorStop(1, colors[1]);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
        }
    }

    drawOrbital() {
        // Inspired by moon-like orbital motions creating spirograph patterns
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = Math.min(this.width, this.height) / 4;

        // Create multiple orbital layers
        const orbits = 3;
        const pointsPerOrbit = 64;

        for (let orbit = 0; orbit < orbits; orbit++) {
            const orbitRadius = baseRadius * (1 + orbit * 0.4);
            const dataStep = Math.floor(this.bufferLength / pointsPerOrbit);

            this.ctx.beginPath();

            for (let i = 0; i < pointsPerOrbit; i++) {
                const dataIndex = Math.min(i * dataStep, this.bufferLength - 1);
                const amplitude = (this.dataArray[dataIndex] / 255.0) * this.sensitivity;

                // Main orbital angle
                const angle = (i / pointsPerOrbit) * Math.PI * 2;

                // Add epicycle (small circle orbiting on the main orbit)
                const epicycleRadius = amplitude * 30;
                const epicycleAngle = angle * (orbit + 2); // Different speeds for each orbit

                // Calculate position with epicycle
                const mainX = centerX + Math.cos(angle) * orbitRadius;
                const mainY = centerY + Math.sin(angle) * orbitRadius;
                const x = mainX + Math.cos(epicycleAngle) * epicycleRadius;
                const y = mainY + Math.sin(epicycleAngle) * epicycleRadius;

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            this.ctx.closePath();

            // Gradient for each orbit
            const gradient = this.ctx.createLinearGradient(
                centerX - orbitRadius, centerY,
                centerX + orbitRadius, centerY
            );
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Add glow
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = colors[0];
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    drawFlower() {
        // Cardioid flower pattern inspired by orbital ratios
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = Math.min(this.width, this.height) / 3;

        // Number of petals based on audio
        const avgAmplitude = this.dataArray.reduce((a, b) => a + b, 0) / this.bufferLength / 255.0;
        const petals = Math.floor(6 + avgAmplitude * 6); // 6-12 petals

        this.ctx.lineWidth = 2;

        // Draw each petal
        for (let petal = 0; petal < petals; petal++) {
            const petalAngle = (petal / petals) * Math.PI * 2;

            this.ctx.beginPath();

            const pointsPerPetal = Math.floor(this.bufferLength / petals);
            for (let i = 0; i < pointsPerPetal; i++) {
                const dataIndex = petal * pointsPerPetal + i;
                if (dataIndex >= this.bufferLength) break;

                const amplitude = (this.dataArray[dataIndex] / 255.0) * this.sensitivity;

                // Parametric equation for cardioid-like shape
                const t = (i / pointsPerPetal) * Math.PI * 2;
                const r = baseRadius * (1 + amplitude) * (1 - Math.cos(t));

                const angle = petalAngle + t / petals;
                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            // Gradient from center to edge
            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 2);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);

            this.ctx.strokeStyle = gradient;
            this.ctx.stroke();

            // Add glow effect
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = colors[1];
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    drawGalaxy() {
        // Spiral galaxy pattern inspired by orbital mechanics
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const maxRadius = Math.min(this.width, this.height) / 2;

        // Number of spiral arms
        const arms = 4;
        const rotationSpeed = Date.now() / 5000; // Slow rotation

        for (let arm = 0; arm < arms; arm++) {
            const armAngle = (arm / arms) * Math.PI * 2 + rotationSpeed;

            this.ctx.beginPath();

            const pointsPerArm = Math.floor(this.bufferLength / arms);
            for (let i = 0; i < pointsPerArm; i++) {
                const dataIndex = arm * pointsPerArm + i;
                if (dataIndex >= this.bufferLength) break;

                const amplitude = (this.dataArray[dataIndex] / 255.0) * this.sensitivity;

                // Logarithmic spiral (galaxy arm shape)
                const t = (i / pointsPerArm);
                const radius = t * maxRadius;
                const spiralTightness = 0.3;
                const angle = armAngle + t * Math.PI * 4 * spiralTightness;

                // Add amplitude variation
                const r = radius + amplitude * 30;

                const x = centerX + r * Math.cos(angle);
                const y = centerY + r * Math.sin(angle);

                // Draw star-like points
                const starSize = amplitude * 5 + 1;

                if (i % 3 === 0) { // Draw stars at intervals
                    const starGradient = this.ctx.createRadialGradient(x, y, 0, x, y, starSize);
                    const schemes = {
                        gradient1: ['#667eea', '#764ba2'],
                        gradient2: ['#f093fb', '#f5576c'],
                        gradient3: ['#4facfe', '#00f2fe'],
                        gradient4: ['#43e97b', '#38f9d7'],
                        gradient5: ['#fa709a', '#fee140'],
                        gradient6: ['#30cfd0', '#330867']
                    };
                    const colors = schemes[this.colorScheme];
                    starGradient.addColorStop(0, colors[0]);
                    starGradient.addColorStop(1, 'transparent');

                    this.ctx.fillStyle = starGradient;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, starSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }

                if (i === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }

            // Draw spiral arm
            const gradient = this.ctx.createLinearGradient(centerX, centerY, centerX + maxRadius, centerY);
            const schemes = {
                gradient1: ['#667eea', '#764ba2'],
                gradient2: ['#f093fb', '#f5576c'],
                gradient3: ['#4facfe', '#00f2fe'],
                gradient4: ['#43e97b', '#38f9d7'],
                gradient5: ['#fa709a', '#fee140'],
                gradient6: ['#30cfd0', '#330867']
            };
            const colors = schemes[this.colorScheme];
            gradient.addColorStop(0, colors[0] + '40');
            gradient.addColorStop(1, colors[1] + '80');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Add glow
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = colors[0];
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }

    async exportToMP4() {
        const exportStatus = document.getElementById('exportStatus');
        exportStatus.textContent = 'Checking browser support...';
        exportStatus.style.color = '#4aa3ff';

        try {
            // Check MediaRecorder support and find best codec
            let mimeType = '';
            const codecs = [
                'video/webm;codecs=vp9,opus',
                'video/webm;codecs=vp8,opus',
                'video/webm;codecs=h264,opus',
                'video/webm',
                'video/mp4'
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

            // Create canvas stream
            const canvasStream = this.canvas.captureStream(30); // 30 FPS

            // Create combined stream
            const combinedStream = new MediaStream();

            // Add video track from canvas
            canvasStream.getVideoTracks().forEach(track => {
                combinedStream.addTrack(track);
            });

            // Add audio track from audio element
            if (this.audioElement && this.audioElement.captureStream) {
                const audioStream = this.audioElement.captureStream();
                audioStream.getAudioTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            } else if (this.audioElement) {
                // Fallback: use Web Audio API to capture audio
                const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
                const tempSource = tempAudioContext.createMediaElementSource(this.audioElement);
                const tempDestination = tempAudioContext.createMediaStreamDestination();
                tempSource.connect(tempDestination);
                tempSource.connect(tempAudioContext.destination);

                tempDestination.stream.getAudioTracks().forEach(track => {
                    combinedStream.addTrack(track);
                });
            }

            exportStatus.textContent = 'Preparing recorder...';

            // Setup MediaRecorder with detected codec
            const options = {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000
            };

            this.recordedChunks = [];
            this.mediaRecorder = new MediaRecorder(combinedStream, options);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                    console.log('Recorded chunk:', event.data.size, 'bytes');
                }
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                exportStatus.textContent = `Recording error: ${event.error?.message || 'Unknown error'}`;
                exportStatus.style.color = '#f5576c';
            };

            this.mediaRecorder.onstop = () => {
                console.log('Recording stopped. Total chunks:', this.recordedChunks.length);

                if (this.recordedChunks.length === 0) {
                    exportStatus.textContent = 'No data recorded. Please try again.';
                    exportStatus.style.color = '#f5576c';
                    return;
                }

                const blob = new Blob(this.recordedChunks, { type: mimeType });
                console.log('Created blob:', blob.size, 'bytes');

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
                a.download = `audio_visualization_${Date.now()}.${extension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);

                setTimeout(() => URL.revokeObjectURL(url), 1000);

                exportStatus.textContent = `✓ Export completed! (${(blob.size / 1024 / 1024).toFixed(2)} MB)`;
                exportStatus.style.color = '#43e97b';

                setTimeout(() => {
                    exportStatus.textContent = '';
                }, 5000);
            };

            // Start recording with timeslice for better data handling
            this.mediaRecorder.start(100); // Capture data every 100ms

            exportStatus.textContent = '🔴 Recording... (Audio will play automatically)';
            exportStatus.style.color = '#f5576c';

            // Auto-play if not playing
            if (!this.isPlaying) {
                await this.audioElement.play();
                this.isPlaying = true;
                this.animate();

                document.getElementById('playBtn').disabled = true;
                document.getElementById('pauseBtn').disabled = false;
                document.getElementById('stopBtn').disabled = false;
            }

            // Stop recording when audio ends
            const stopHandler = () => {
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    console.log('Audio ended, stopping recording...');
                    this.mediaRecorder.stop();
                }
            };

            this.audioElement.addEventListener('ended', stopHandler, { once: true });

        } catch (error) {
            console.error('Export error:', error);
            exportStatus.textContent = `Export failed: ${error.message}`;
            exportStatus.style.color = '#f5576c';
        }
    }
}

// Initialize the visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new AudioVisualizer();
});
