// test-ffmpeg-stream.js
// Test the FFmpeg Axis streamer

const AxisFFmpegStreamer = require('./axis-ffmpeg-streamer');
const path = require('path');

// Your actual device configuration
const config = {
    ip: '10.176.13.98',
    username: 'root',
    password: 'pass'
};

async function main() {
    console.log('='.repeat(70));
    console.log('Axis Speaker - FFmpeg Streaming Test');
    console.log('='.repeat(70));
    console.log(`Target: ${config.ip}`);
    console.log('');

    const streamer = new AxisFFmpegStreamer(config.ip, config.username, config.password);

    // Check if FFmpeg is available
    console.log('Checking FFmpeg availability...');
    const ffmpegAvailable = await streamer.checkFFmpeg();

    if (!ffmpegAvailable) {
        console.error('❌ FFmpeg not found! Please ensure ffmpeg.exe is in the same directory or in PATH.');
        process.exit(1);
    }

    console.log('✅ FFmpeg is available\n');

    // Test 1: Connection test with beep
    try {
        console.log('Test 1: Sending test beep (1 second)...');
        await streamer.testConnection(1);
        console.log('');
    } catch (error) {
        console.error('Connection test failed:', error.error);
    }

    // Test 2: Stream actual audio file if provided
    const audioFile = process.argv[2];

    if (audioFile) {
        try {
            console.log('Test 2: Streaming audio file...');
            console.log(`File: ${audioFile}\n`);

            const result = await streamer.streamAudio(audioFile);

            console.log('\n📊 Streaming Results:');
            console.log(`   Size: ${result.size}`);
            console.log(`   Duration: ${result.duration}`);
            console.log(`   Speed: ${result.speed}`);

        } catch (error) {
            console.error('Streaming failed:', error.error);
            if (error.stderr) {
                console.error('FFmpeg output:', error.stderr);
            }
        }
    } else {
        console.log('💡 Tip: Pass an audio file as argument to test streaming:');
        console.log('   node test-ffmpeg-stream.js "path/to/audio.mp3"');
    }

    console.log('\n' + '='.repeat(70));
}

main().catch(console.error);
