const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const createPost = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'user_alpha',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        // 2. Create Post
        console.log('Creating post...');
        const postRes = await axios.post(`${API_URL}/posts`,
            {
                text: 'Hello World! This is a test post for verification.',
                image: '' // Optional
            },
            {
                headers: { 'x-auth-token': token }
            }
        );
        console.log('Post created successfully:', postRes.data._id);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
};

createPost();
