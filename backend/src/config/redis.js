// backend/src/config/redis.js
const Redis = require('ioredis');

// Default Redis connection URL (for development with Docker Compose)
const DEFAULT_REDIS_URL = 'redis://redis:6379';

// Create Redis client with retry strategy
// Create Redis client with retry strategy
const redisUrl = process.env.REDIS_URL;

console.log('--- Redis Connection Debug ---');
if (redisUrl) {
    console.log('REDIS_URL is set:', redisUrl.substring(0, 15) + '...');
} else {
    console.error('REDIS_URL is NOT set. Falling back to default host: redis');
}

const redisClient = redisUrl
    ? new Redis(redisUrl)
    : new Redis({
        host: process.env.REDIS_HOST || 'redis',
        port: process.env.REDIS_PORT || 6379,
        retryStrategy: (times) => {
            const delay = Math.min(times * 100, 5000);
            console.log(`Retrying to connect to Redis in ${delay}ms...`);
            return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        showFriendlyErrorStack: process.env.NODE_ENV !== 'production'
    });

// Event handlers
redisClient.on('connect', () => {
    console.log('Redis client connected');
});

redisClient.on('ready', () => {
    console.log('Redis client ready to use');
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

redisClient.on('end', () => {
    console.log('Redis connection closed');
});

// Test the connection when the module is loaded
(async () => {
    try {
        await redisClient.ping();
        console.log('Successfully connected to Redis');
    } catch (error) {
        console.error('Failed to connect to Redis:', error.message);
    }
})();

// For backward compatibility, keep the mock methods but don't use them by default
if (process.env.NODE_ENV === 'test') {
    console.log('Using mock Redis client for testing');
    redisClient.get = async () => null;
    redisClient.set = async () => 'OK';
    redisClient.on = () => { };
    redisClient.ping = async () => 'PONG';
}

module.exports = redisClient;