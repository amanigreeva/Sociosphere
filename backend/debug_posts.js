const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Post = require('./src/models/Post');
const User = require('./src/models/User');

dotenv.config();

const debugPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ username: 'moni_01' });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const posts = await Post.find({ userId: user._id });
        console.log(`Total Posts found: ${posts.length}`);

        posts.forEach((p, index) => {
            const media = p.media && p.media.length > 0 ? p.media[0] : p.image || 'No Media';
            const isVideo = (url) => {
                if (!url) return false;
                const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
                const lowerUrl = url.toLowerCase();
                for (let ext of videoExtensions) {
                    if (lowerUrl.includes(ext)) return true;
                }
                return false;
            };

            console.log(`Post ${index + 1}: ID=${p._id}, Media=${media}, IsVideo=${isVideo(media)}, Text=${p.text?.substring(0, 20)}...`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debugPosts();
