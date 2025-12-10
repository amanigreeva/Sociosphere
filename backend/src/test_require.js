
try {
    console.log('Requiring authMiddleware...');
    const authMiddleware = require('./middleware/authMiddleware');
    console.log('Successfully required authMiddleware');
} catch (error) {
    console.error('Failed to require authMiddleware:', error);
}
