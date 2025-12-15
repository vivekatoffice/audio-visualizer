// test-axis-simple.js
// Test using axios-digest library

const AxisStreamer = require('./axis-streamer-simple');

const config = {
    ip: '10.176.13.98',
    username: 'root',
    password: 'pass'
};

console.log('='.repeat(60));
console.log('Axis Speaker Connection Test (axios-digest)');
console.log('='.repeat(60));
console.log(`Device IP: ${config.ip}`);
console.log(`Username: ${config.username}`);
console.log('');

async function runTest() {
    const streamer = new AxisStreamer(config.ip, config.username, config.password);

    console.log('Testing connection with Digest Auth...');
    const result = await streamer.testConnection();

    if (result.success) {
        console.log('\n✅ SUCCESS!');
    } else {
        console.log('\n❌ FAILED!');
        console.log('Error:', result.error);
    }

    console.log('\n' + '='.repeat(60));
}

runTest().catch(console.error);
