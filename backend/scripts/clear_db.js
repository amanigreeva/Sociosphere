const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Notification = require('./src/models/Notification');
const redisClient = require('./src/config/redis');

dotenv.config();

const clearDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Redis client is auto-connecting via ioredis
        console.log('Redis Client Loaded');

        // Clear MongoDB
        await User.deleteMany({});
        console.log('Users cleared');

        await Post.deleteMany({});
        console.log('Posts cleared');

        await Notification.deleteMany({});
        console.log('Notifications cleared');

        // Clear Redis
        try {
            await redisClient.flushall();
            console.log('Redis cache cleared');
        } catch (redisError) {
            console.error('Error clearing Redis (continuing):', redisError.message);
        }

        console.log('Database cleared successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing database:', error);
        process.exit(1);
    }
};

clearDB();
