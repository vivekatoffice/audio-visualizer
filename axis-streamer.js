// axis-streamer.js
// Axis Speaker Streaming Module with Digest Authentication

const axios = require('axios');
const crypto = require('crypto');

class AxisStreamer {
    constructor(ip, username, password) {
        this.ip = ip;
        this.username = username;
        this.password = password;
        this.baseUrl = `http://${ip}`;
    }

    /**
     * Compute Digest Auth response
     */
    computeDigestAuth(method, uri, authHeader) {
        const authParams = {};
        const regex = /(\w+)=["']?([^"',]+)["']?/g;
        let match;

        while ((match = regex.exec(authHeader)) !== null) {
            authParams[match[1]] = match[2];
        }

        const realm = authParams.realm;
        const nonce = authParams.nonce;
        const qop = authParams.qop;
        const opaque = authParams.opaque;

        const ha1 = crypto.createHash('md5')
            .update(`${this.username}:${realm}:${this.password}`)
            .digest('hex');

        const ha2 = crypto.createHash('md5')
            .update(`${method}:${uri}`)
            .digest('hex');

        const nc = '00000001';
        const cnonce = crypto.randomBytes(16).toString('hex');

        const response = crypto.createHash('md5')
            .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
            .digest('hex');

        return {
            username: this.username,
            realm,
            nonce,
            uri,
            qop,
            nc,
            cnonce,
            response,
            opaque
        };
    }

    /**
     * Make request with Digest Auth
     */
    async makeDigestRequest(method, path, data = null, contentType = null) {
        const url = `${this.baseUrl}${path}`;

        try {
            // First request to get challenge
            console.log(`Making ${method} request to ${path}`);
            const reqConfig = {
                method,
                url,
                validateStatus: () => true
            };

            if (contentType) {
                reqConfig.headers = { 'Content-Type': contentType };
            }

            if (data) {
                reqConfig.data = data;
            }

            let response = await axios(reqConfig);
            console.log(`Initial response status: ${response.status}`);

            // If 401, compute digest and retry
            if (response.status === 401) {
                const wwwAuth = response.headers['www-authenticate'];
                console.log('Got 401, WWW-Authenticate header:', wwwAuth);

                if (!wwwAuth || !wwwAuth.includes('Digest')) {
                    throw new Error('Server does not support Digest authentication');
                }

                const digestParams = this.computeDigestAuth(method, path, wwwAuth);

                const authHeader = `Digest username="${digestParams.username}", ` +
                    `realm="${digestParams.realm}", ` +
                    `nonce="${digestParams.nonce}", ` +
                    `uri="${digestParams.uri}", ` +
                    `qop=${digestParams.qop}, ` +
                    `nc=${digestParams.nc}, ` +
                    `cnonce="${digestParams.cnonce}", ` +
                    `response="${digestParams.response}", ` +
                    `opaque="${digestParams.opaque}"`;

                console.log('Retrying with Digest authentication...');

                const headers = {
                    'Authorization': authHeader
                };

                if (contentType) {
                    headers['Content-Type'] = contentType;
                }

                const retryConfig = {
                    method,
                    url,
                    headers,
                    validateStatus: () => true
                };

                if (data) {
                    retryConfig.data = data;
                }

                response = await axios(retryConfig);
                console.log(`Authenticated response status: ${response.status}`);
            }

            if (response.status >= 200 && response.status < 300) {
                return { success: true, data: response.data, status: response.status };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText || 'Error'}`);
            }

        } catch (error) {
            console.error('Request failed:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Test connection to Axis device
     */
    async testConnection() {
        console.log(`Testing connection to ${this.ip}...`);
        const result = await this.makeDigestRequest(
            'GET',
            '/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder'
        );

        if (result.success) {
            console.log('✅ Connection successful!');
            console.log('Device capabilities:', result.data);
        } else {
            console.error('❌ Connection failed:', result.error);
        }

        return result;
    }

    /**
     * Stream audio data to Axis speaker
     * @param {Buffer} audioData - Audio data in G.711 µ-law format
     */
    async streamAudio(audioData) {
        console.log(`Streaming ${audioData.length} bytes to Axis speaker...`);

        const result = await this.makeDigestRequest(
            'POST',
            '/axis-cgi/audio/transmit.cgi',
            audioData,
            'audio/basic' // G.711 µ-law
        );

        if (result.success) {
            console.log('✅ Audio streamed successfully');
        } else {
            console.error('❌ Streaming failed:', result.error);
        }

        return result;
    }

    /**
     * Stream audio file
     * @param {string} filePath - Path to audio file
     */
    async streamAudioFile(filePath) {
        const fs = require('fs');

        console.log(`Reading audio file: ${filePath}`);
        const audioData = fs.readFileSync(filePath);

        // TODO: Convert audio to G.711 µ-law format if needed
        // For now, assuming file is already in correct format

        return await this.streamAudio(audioData);
    }
}

module.exports = AxisStreamer;
