const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

const seedOneReel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.error('User moni_01 not found.');
            process.exit(1);
        }

        const newReel = new Post({
            userId: user._id,
            text: "Testing the new Reels UI! 🎥 #design",
            media: ["http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"],
            category: 'ART',
            likes: [],
            comments: []
        });

        await newReel.save();
        console.log('Successfully seeded 1 test reel.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedOneReel();
