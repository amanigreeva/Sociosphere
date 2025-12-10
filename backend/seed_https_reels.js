const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

// Using HTTPS URLs to avoid mixed content issues
const sampleReels = [
    {
        text: "Morning vibes! ☀️ #nature #peace",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        category: "OTHER"
    },
    {
        text: "Epic workout session 💪 #gym #motivation",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        category: "GYM"
    },
    {
        text: "Can't believe this happened! 😱 #fail #funny",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        category: "OTHER"
    },
    {
        text: "Delicious street food 🍜 #foodie #travel",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        category: "FOOD"
    },
    {
        text: "Big Buck Bunny Trailer 🐰 #animation",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        category: "MOVIES"
    }
];

const seedReels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.error('User moni_01 not found.');
            process.exit(1);
        }

        for (const reel of sampleReels) {
            const newReel = new Post({
                userId: user._id,
                text: reel.text,
                media: [reel.video],
                category: reel.category,
                likes: [],
                comments: []
            });
            await newReel.save();
            console.log(`Seeded HTTPS reel: ${reel.text}`);
        }

        console.log('Successfully seeded 5 HTTPS reels.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedReels();
