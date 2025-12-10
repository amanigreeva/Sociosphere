const axios = require('axios');

const checkLogin = async () => {
    try {
        // Backend expects 'email' field to hold username OR email
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'user_alpha',
            password: 'password123'
        });
        console.log('Login Successful:', response.data.success);
    } catch (error) {
        if (error.response) {
            console.log(`Login Failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else {
            console.log('Login Error:', error.message);
        }
    }
};

checkLogin();
