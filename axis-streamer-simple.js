// axis-streamer-simple.js
// Simplified Axis Speaker Streaming using axios-digest library

const AxiosDigest = require('axios-digest');

class AxisStreamer {
    constructor(ip, username, password) {
        this.ip = ip;
        this.username = username;
        this.password = password;
        this.baseUrl = `http://${ip}`;
        this.digestClient = new AxiosDigest(username, password);
    }

    /**
     * Test connection to Axis device
     */
    async testConnection() {
        console.log(`Testing connection to ${this.ip}...`);

        try {
            const url = `${this.baseUrl}/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder`;

            const response = await this.digestClient.get(url);

            console.log('✅ Connection successful!');
            console.log(`Status: ${response.status}`);
            console.log('Device capabilities:', response.data);

            return { success: true, data: response.data, status: response.status };
        } catch (error) {
            console.error('❌ Connection failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream audio data to Axis speaker
     * @param {Buffer} audioData - Audio data in G.711 µ-law format
     */
    async streamAudio(audioData) {
        console.log(`Streaming ${audioData.length} bytes to Axis speaker...`);

        try {
            const url = `${this.baseUrl}/axis-cgi/audio/transmit.cgi`;

            const response = await this.digestClient.post(url, audioData, {
                headers: {
                    'Content-Type': 'audio/basic' // G.711 µ-law
                }
            });

            console.log('✅ Audio streamed successfully');
            console.log(`Status: ${response.status}`);

            return { success: true, status: response.status };
        } catch (error) {
            console.error('❌ Streaming failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Stream audio file
     * @param {string} filePath - Path to audio file
     */
    async streamAudioFile(filePath) {
        const fs = require('fs');

        console.log(`Reading audio file: ${filePath}`);
        const audioData = fs.readFileSync(filePath);

        return await this.streamAudio(audioData);
    }
}

module.exports = AxisStreamer;
