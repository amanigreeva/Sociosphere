const axios = require('axios');

async function testLogin(identifier, password) {
    try {
        console.log(`Testing login for: ${identifier} ...`);
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: identifier,
            password: password
        });
        console.log(`SUCCESS! Token: ${res.data.token ? 'Yes' : 'No'}`);
    } catch (err) {
        console.log(`FAILED! Status: ${err.response?.status} - ${err.response?.data?.message}`);
    }
}

async function run() {
    await testLogin('user_alpha', 'password123');
    await testLogin('alpha@test.com', 'password123');
}

run();
