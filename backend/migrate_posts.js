const mongoose = require('mongoose');
const Post = require('./src/models/Post');
require('dotenv').config();

const migratePosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const result = await Post.updateMany(
            { isArchived: { $exists: false } },
            { $set: { isArchived: false } }
        );

        console.log(`Matched ${result.matchedCount} documents.`);
        console.log(`Modified ${result.modifiedCount} documents.`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

migratePosts();
