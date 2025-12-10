const axios = require('axios');

const checkLogins = async () => {
    const users = [
        { email: 'user_alpha', password: 'password123' },
        { email: 'user_beta', password: 'password123' }
    ];

    for (const u of users) {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', u);
            console.log(`Login Successful for ${u.email}:`, response.data.success);
            if (response.data.user) {
                console.log(`User ID for ${u.email}: ${response.data.user._id}`);
            }
        } catch (error) {
            if (error.response) {
                console.log(`Login Failed for ${u.email}: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else {
                console.log(`Login Error for ${u.email}:`, error.message);
            }
        }
    }
};

checkLogins();
