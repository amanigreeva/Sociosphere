const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5001';

const testProfile = async () => {
    try {
        const username = 'moni_01';
        console.log(`Fetching profile posts for ${username}...`);
        const res = await axios.get(`${BASE_URL}/api/posts/profile/${username}`);

        console.log('Status:', res.status);
        console.log('Posts found:', res.data.length);
        res.data.forEach(p => {
            console.log(`- Post: ${p._id}, Archived: ${p.isArchived}`);
        });

    } catch (err) {
        console.error('Fetch Failed:', err.message);
        if (err.response) console.error(err.response.data);
    }
};

testProfile();
