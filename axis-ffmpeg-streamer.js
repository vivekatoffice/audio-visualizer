// axis-ffmpeg-streamer.js
// Axis Speaker Streaming Module using FFmpeg
// WORKING SOLUTION - Tested and confirmed with actual device

const { spawn } = require('child_process');
const path = require('path');

class AxisFFmpegStreamer {
    constructor(ip, username, password) {
        this.ip = ip;
        this.username = username;
        this.password = password;
        this.currentFFmpegProcess = null;  // Track active streaming process

        // Try to use bundled ffmpeg-static, fallback to system ffmpeg
        try {
            this.ffmpegPath = require('ffmpeg-static');
            console.log('[Axis] Using bundled FFmpeg:', this.ffmpegPath);
        } catch (e) {
            this.ffmpegPath = 'ffmpeg.exe';
            console.log('[Axis] Using system FFmpeg');
        }
    }

    /**
     * Stop current streaming
     */
    stopStreaming() {
        if (this.currentFFmpegProcess) {
            console.log('[Axis] Stopping current stream...');
            try {
                this.currentFFmpegProcess.kill('SIGTERM');
                this.currentFFmpegProcess = null;
                console.log('[Axis] ⏹️ Stream stopped');
                return { success: true, message: 'Stream stopped' };
            } catch (error) {
                console.error('[Axis] Error stopping stream:', error);
                return { success: false, error: error.message };
            }
        } else {
            console.log('[Axis] No active stream to stop');
            return { success: false, message: 'No active stream' };
        }
    }

    /**
     * Stream audio file to Axis speaker
     * @param {string} inputFile - Path to audio file (any format: MP3, WAV, M4A, etc.)
     * @returns {Promise} Resolves when streaming completes
     */
    streamAudio(inputFile) {
        // Stop any existing stream first
        this.stopStreaming();

        return new Promise((resolve, reject) => {
            const url = `http://${this.username}:${this.password}@${this.ip}/axis-cgi/audio/transmit.cgi`;

            // Exact working parameters from successful test
            const args = [
                '-i', inputFile,
                '-probesize', '32',
                '-analyzeduration', '32',
                '-c:a', 'pcm_mulaw',        // µ-law PCM codec
                '-ab', '128k',               // 128 kbps bitrate
                '-ac', '1',                  // Mono (1 channel)
                '-ar', '16000',              // 16 kHz sample rate
                '-f', 'wav',                 // WAV format
                '-chunked_post', '0',        // Disable chunked transfer
                '-content_type', 'audio/axis-mulaw-128',  // Axis-specific MIME type
                url
            ];

            console.log(`[Axis] Streaming: ${path.basename(inputFile)} -> ${this.ip}`);

            const ffmpeg = spawn(this.ffmpegPath, args);
            this.currentFFmpegProcess = ffmpeg;  // Track the process

            let stderr = '';

            ffmpeg.stdout.on('data', (data) => {
                // FFmpeg outputs to stderr, not stdout
            });

            ffmpeg.stderr.on('data', (data) => {
                stderr += data.toString();
                // Show progress
                const match = data.toString().match(/time=(\d+:\d+:\d+\.\d+)/);
                if (match) {
                    console.log(`[Axis] Progress: ${match[1]}`);
                }
            });

            ffmpeg.on('close', (code) => {
                this.currentFFmpegProcess = null;  // Clear reference

                if (code === 0) {
                    console.log('✅ [Axis] Audio streamed successfully!');

                    // Extract info from stderr
                    const sizeMatch = stderr.match(/size=\s*(\S+)/);
                    const timeMatch = stderr.match(/time=(\d+:\d+:\d+\.\d+)/);
                    const speedMatch = stderr.match(/speed=\s*(\S+)/);

                    resolve({
                        success: true,
                        size: sizeMatch ? sizeMatch[1] : 'unknown',
                        duration: timeMatch ? timeMatch[1] : 'unknown',
                        speed: speedMatch ? speedMatch[1] : 'unknown'
                    });
                } else if (code === null || code === 255) {
                    // Process was killed  
                    console.log('⏹️ [Axis] Stream stopped by user');
                    resolve({ success: false, stopped: true, message: 'Stream stopped' });
                } else {
                    console.error(`❌ [Axis] FFmpeg exited with code ${code}`);
                    reject({
                        success: false,
                        error: `FFmpeg exit code ${code}`,
                        stderr: stderr
                    });
                }
            });

            ffmpeg.on('error', (err) => {
                this.currentFFmpegProcess = null;  // Clear reference
                console.error('❌ [Axis] FFmpeg error:', err.message);
                reject({
                    success: false,
                    error: err.message
                });
            });
        });
    }

    /**
     * Test connection by generating and streaming a short beep
     * @param {number} duration - Duration in seconds (default: 1)
     * @returns {Promise}
     */
    testConnection(duration = 1) {
        return new Promise((resolve, reject) => {
            const url = `http://${this.username}:${this.password}@${this.ip}/axis-cgi/audio/transmit.cgi`;

            // Generate a test tone (1000 Hz)
            const args = [
                '-f', 'lavfi',
                '-i', `sine=frequency=1000:duration=${duration}`,
                '-c:a', 'pcm_mulaw',
                '-ab', '128k',
                '-ac', '1',
                '-ar', '16000',
                '-f', 'wav',
                '-chunked_post', '0',
                '-content_type', 'audio/axis-mulaw-128',
                url
            ];

            console.log(`[Axis] Testing connection with ${duration}s beep...`);

            const ffmpeg = spawn(this.ffmpegPath, args);

            ffmpeg.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ [Axis] Test beep sent successfully');
                    resolve({ success: true, message: 'Connection test successful' });
                } else {
                    console.error(`❌ [Axis] Test failed with code ${code}`);
                    reject({ success: false, error: `Exit code ${code}` });
                }
            });

            ffmpeg.on('error', (err) => {
                reject({ success: false, error: err.message });
            });
        });
    }

    /**
     * Check if FFmpeg is available
     * @returns {Promise<boolean>}
     */
    checkFFmpeg() {
        return new Promise((resolve) => {
            const ffmpeg = spawn(this.ffmpegPath, ['-version']);

            ffmpeg.on('close', (code) => {
                resolve(code === 0);
            });

            ffmpeg.on('error', () => {
                resolve(false);
            });
        });
    }

    /**
     * Check if there's an active stream
     * @returns {boolean}
     */
    isStreaming() {
        return this.currentFFmpegProcess !== null;
    }
}

module.exports = AxisFFmpegStreamer;
