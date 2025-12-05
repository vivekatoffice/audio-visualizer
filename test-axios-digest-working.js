// test-axios-digest-working.js
// Working test with correct axios-digest usage

const { default: AxiosDigest } = require('axios-digest');

const config = {
    ip: '10.176.13.98',
    username: 'root',
    password: 'pass'
};

console.log('=========================================================================================');
console.log('Axis Speaker - Digest Auth Test');
console.log('='.repeat(60));

async function test() {
    try {
        const client = new AxiosDigest(config.username, config.password);
        const url = `http://${config.ip}/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder`;

        console.log(`Target: ${config.ip}`);
        console.log(`User: ${config.username}`);
        console.log('Authenticating with Digest Auth...\n');

        const response = await client.get(url);

        console.log('✅ CONNECTION SUCCESSFUL!');
        console.log(`Status: ${response.status}`);
        console.log('\n📄 Device Audio Capabilities:');
        console.log('─'.repeat(60));
        console.log(response.data);
        console.log('─'.repeat(60));

    } catch (error) {
        console.log('❌ CONNECTION FAILED!');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('HTTP Status:', error.response.status);
        }
    }

    console.log('\n' + '='.repeat(60));
}

test();
