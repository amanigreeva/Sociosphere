const mongoose = require('mongoose');
require('dotenv').config();

const Stream = require('./src/models/Stream');

const checkIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sociosphere');
        console.log('Connected to MongoDB');

        const indexes = await Stream.collection.getIndexes();
        console.log('Indexes for Streams:', JSON.stringify(indexes, null, 2));

        mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        mongoose.disconnect();
    }
};

checkIndexes();
