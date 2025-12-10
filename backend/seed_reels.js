const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

// Sample Video URLs (Public Test Videos)
const VIDEOS = [
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

const SAMPLE_REELS = [
    { text: "Crushing the leg day workout! 💪 #gym #fitness #legday", category: "GYM", videoIndex: 2 },
    { text: "Healthy meal prep ideas for the week 🥗 #food #mealprep #healthy", category: "FOOD", videoIndex: 4 },
    { text: "Amazing digital art process revealed 🎨 #art #digitalart #creative", category: "ART", videoIndex: 0 },
    { text: "Did you know? The universe is expanding faster than light! 🌌 #space #facts #universe", category: "TECH", videoIndex: 7 }, // Mapped Space to Tech/Science
    { text: "General Knowledge: The longest river in the world is the Nile 🌍 #gk #knowledge", category: "OTHER", videoIndex: 3 },
    { text: "Top 5 movies to watch this weekend 🎬 #movies #cinema", category: "MOVIES", videoIndex: 1 },
    { text: "Checking out the latest tech gadgets 📱 #tech #gadgets #review", category: "TECH", videoIndex: 9 },
    { text: "Delicious burger recipe 🍔 #food #cooking #yummy", category: "FOOD", videoIndex: 5 },
    { text: "Morning yoga routine for flexibility 🧘‍♀️ #gym #yoga #wellness", category: "GYM", videoIndex: 6 },
    { text: "Fun facts about animals 🐘 #facts #animals #nature", category: "OTHER", videoIndex: 8 }
];

const seedReels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find user to assign posts to (moni_01)
        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.error('User moni_01 not found! Please ensure user exists.');
            process.exit(1);
        }

        console.log(`Seeding reels for user: ${user.username} (${user._id})`);

        const postsToInsert = SAMPLE_REELS.map(reel => ({
            userId: user._id,
            text: reel.text,
            category: reel.category,
            media: [VIDEOS[reel.videoIndex]],
            likes: [],
            comments: []
        }));

        await Post.insertMany(postsToInsert);
        console.log(`Successfully seeded ${postsToInsert.length} reels!`);

        process.exit(0);
    } catch (err) {
        console.error('Error seeding reels:', err);
        process.exit(1);
    }
};

seedReels();
