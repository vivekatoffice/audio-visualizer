// test-axis-connection.js
// Quick test script for Axis speaker connection with Digest Auth

const AxisStreamer = require('./axis-streamer');

// Device configuration
const config = {
    ip: '10.176.13.98',
    username: 'root',
    password: 'pass'
};

console.log('='.repeat(60));
console.log('Axis Speaker Connection Test');
console.log('='.repeat(60));
console.log(`Device IP: ${config.ip}`);
console.log(`Username: ${config.username}`);
console.log('');

async function runTest() {
    // Create streamer instance
    const streamer = new AxisStreamer(config.ip, config.username, config.password);

    // Test connection
    console.log('Testing connection with Digest Auth...');
    const result = await streamer.testConnection();

    if (result.success) {
        console.log('\n✅ SUCCESS! Device is accessible with Digest Auth');
        console.log('\nDevice Response:');
        console.log(result.data);
    } else {
        console.log('\n❌ FAILED!');
        console.log('Error:', result.error);
    }

    console.log('\n' + '='.repeat(60));
}

runTest().catch(console.error);
