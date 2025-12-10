const redisClient = require('../config/redis');

const rateLimiter = (limit, windowSeconds) => {
    return async (req, res, next) => {
        const ip = req.ip;
        const key = `rate_limit:${ip}`;

        try {
            const requests = await redisClient.incr(key);

            if (requests === 1) {
                await redisClient.expire(key, windowSeconds);
            }

            if (requests > limit) {
                return res.status(429).json({ message: 'Too many requests, please try again later.' });
            }

            next();
        } catch (err) {
            console.error('Redis Error:', err);
            next(); // Allow request if Redis fails
        }
    };
};

module.exports = rateLimiter;
