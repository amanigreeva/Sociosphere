const mongoose = require('mongoose');
require('dotenv').config();

const Stream = require('./src/models/Stream');

const deepCheckIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sociosphere');
        console.log('Connected to MongoDB');

        const indexes = await Stream.collection.listIndexes().toArray();
        console.log('Full Index Info:', JSON.stringify(indexes, null, 2));

        mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        mongoose.disconnect();
    }
};

deepCheckIndexes();
