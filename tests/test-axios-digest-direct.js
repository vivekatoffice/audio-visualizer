// test-axios-digest-direct.js
// Direct test of axios-digest with proper usage

const digest = require('axios-digest');

const config = {
    ip: '10.176.13.98',
    username: 'root',
    password: 'pass'
};

console.log('='.repeat(60));
console.log('Direct Axios-Digest Test');
console.log('='.repeat(60));

async function test() {
    try {
        const url = `http://${config.ip}/axis-cgi/param.cgi?action=list&group=Properties.Audio.Decoder`;

        console.log(`Testing: ${url}`);
        console.log(`User: ${config.username}`);
        console.log('Sending request with Digest Auth...\n');

        const response = await digest(config.username, config.password).get(url);

        console.log('✅ SUCCESS!');
        console.log(`Status: ${response.status}`);
        console.log('\nResponse:');
        console.log(response.data);

    } catch (error) {
        console.log('❌ FAILED!');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }

    console.log('\n' + '='.repeat(60));
}

test();
