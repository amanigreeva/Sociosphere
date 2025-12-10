const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

const cleanupReels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.log('User moni_01 not found.');
            process.exit(1);
        }

        // Find posts by this user that calculate as "video" (have media that looks like video)
        // Since we can't easily execute JS logic in query, we find all and delete via loop or precise query if possible.
        // Or just delete all posts with category 'OTHER', 'GYM', etc that we just seeded.

        // Better: Fetch all posts for user, check isVideo logic, delete.
        const posts = await Post.find({ userId: user._id });
        let deletedCount = 0;

        for (const post of posts) {
            // Check if it's a video
            const isVideo = (url) => {
                if (!url) return false;
                const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
                return videoExtensions.some(ext => url.toLowerCase().includes(ext));
            };

            const mediaUrl = (post.media && post.media.length > 0) ? post.media[0] : post.image;
            if (isVideo(mediaUrl)) {
                await Post.findByIdAndDelete(post._id);
                deletedCount++;
            }
        }

        console.log(`Successfully deleted ${deletedCount} video reels for moni_01.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

cleanupReels();
