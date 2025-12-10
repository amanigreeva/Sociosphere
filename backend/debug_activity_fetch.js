const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5001';

const testFetch = async () => {
    try {
        // 1. Login to get token
        const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'moni_01',
            password: 'moni@123'
        });
        const token = loginRes.data.token;
        console.log('Login Successful. Token received.');

        // 2. Fetch Archived Posts
        const archivedRes = await axios.get(`${BASE_URL}/api/posts/archived`, {
            headers: { 'x-auth-token': token }
        });
        console.log('Archived Posts Count:', archivedRes.data.length);
        archivedRes.data.forEach(p => {
            console.log(`- Post ${p._id}: Media=${p.media.length > 0 ? 'Yes' : 'No'} Image=${p.image ? 'Yes' : 'No'} Archived=${p.isArchived}`);
        });

    } catch (err) {
        console.error('Fetch Failed:', err.message);
        if (err.response) console.error(err.response.data);
    }
};

testFetch();
