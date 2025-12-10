const redis = require('redis');
const client = redis.createClient({
    host: '127.0.0.1',
    port: 6379,
});

client.on('error', (err) => console.log('Redis Client Error', err));

async function clear() {
    await client.connect();
    await client.flushAll();
    console.log('Redis flushed');
    await client.disconnect();
}

clear();
