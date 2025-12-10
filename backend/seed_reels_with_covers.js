const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

const sampleReels = [
    {
        text: "The Big Buck Bunny! 🐰 Check out this classic animation.",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        image: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
        category: "MOVIES"
    },
    {
        text: "Elephants Dream 🐘 - The first open movie project.",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        image: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
        category: "ART"
    },
    {
        text: "Top production values! 🎬 Behind the scenes.",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        image: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg",
        category: "TECH"
    },
    {
        text: "Nature escapes 🌿 Relaxing vibes.",
        video: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        image: "https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg",
        category: "OTHER"
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

        console.log("Removing old reels...");
        // Cleanup existing reels for this user to start fresh
        // (Similar to cleanup_reels_moni.js but integrated here)
        const posts = await Post.find({ userId: user._id });
        for (const post of posts) {
            const isVideo = (url) => {
                if (!url) return false;
                const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
                return videoExtensions.some(ext => url.toLowerCase().includes(ext));
            };
            const mediaUrl = (post.media && post.media.length > 0) ? post.media[0] : post.image;
            if (isVideo(mediaUrl)) {
                await Post.findByIdAndDelete(post._id);
            }
        }
        console.log("Old reels removed.");

        // Add new reels
        for (const reel of sampleReels) {
            const newReel = new Post({
                userId: user._id,
                text: reel.text,
                media: [reel.video],
                image: reel.image, // Explicit cover image
                category: reel.category,
                likes: [],
                comments: []
            });
            await newReel.save();
            console.log(`Seeded Reel: ${reel.text}`);
        }

        console.log('Successfully seeded reels with cover images!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedReels();
