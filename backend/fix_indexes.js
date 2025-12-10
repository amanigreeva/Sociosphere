const mongoose = require('mongoose');
require('dotenv').config();

const Stream = require('./src/models/Stream');

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sociosphere');
        console.log('Connected to MongoDB');

        // Drop the existing index if it exists
        try {
            await Stream.collection.dropIndex('createdAt_1');
            console.log('Dropped existing createdAt_1 index');
        } catch (e) {
            console.log('Index might not exist, proceeding:', e.message);
        }

        // Create the index explicitly (or rely on Schema, but explicit is safer here to verify)
        // Mongoose schema has expires: 86400, so ensuring the old one is gone and restarting app should work, 
        // but let's do it manually here to be immediate.
        await Stream.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 86400 });
        console.log('Created TTL index on createdAt');

        const indexes = await Stream.collection.getIndexes();
        console.log('New Indexes for Streams:', JSON.stringify(indexes, null, 2));

        mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
        mongoose.disconnect();
    }
};

fixIndexes();
