const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

const deduplicateReels = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'moni_01' });

        if (!user) {
            console.log('User moni_01 not found.');
            process.exit(1);
        }

        // Fetch all posts for the user
        const posts = await Post.find({ userId: user._id }).sort({ createdAt: 1 }); // Oldest first

        const seenVideos = new Set();
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
                if (seenVideos.has(mediaUrl)) {
                    // Duplicate found! Delete it.
                    console.log(`Removing duplicate reel: ${post.text.substring(0, 30)}... (${mediaUrl})`);
                    await Post.findByIdAndDelete(post._id);
                    deletedCount++;
                } else {
                    seenVideos.add(mediaUrl);
                }
            }
        }

        console.log(`Cleanup complete. Removed ${deletedCount} duplicate reels.`);
        process.exit(0);

    } catch (err) {
        console.error('Error during deduplication:', err);
        process.exit(1);
    }
};

deduplicateReels();
