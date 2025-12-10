const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

// The exact URLs used in seed_reels.js
const SEEDED_VIDEOS = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
];

const cleanupReels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.error('User moni_01 not found.');
            process.exit(1);
        }

        console.log(`Cleaning up reels for user: ${user.username} (${user._id})`);

        // Delete posts that have media URL matching our seeded list AND belong to moni_01
        const result = await Post.deleteMany({
            userId: user._id,
            'media.0': { $in: SEEDED_VIDEOS } // Check if the first media item is in our list
        });

        console.log(`Successfully deleted ${result.deletedCount} seeded reels.`);

        process.exit(0);
    } catch (err) {
        console.error('Error cleaning up reels:', err);
        process.exit(1);
    }
};

cleanupReels();
