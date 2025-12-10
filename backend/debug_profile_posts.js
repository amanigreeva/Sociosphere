const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
require('dotenv').config();

const checkPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ username: 'moni_01' });
        if (!user) {
            console.log('User moni_01 not found');
            return;
        }
        console.log('User ID:', user._id);

        const allPosts = await Post.find({ userId: user._id });
        console.log(`Found ${allPosts.length} total posts for user.`);

        allPosts.forEach(p => {
            console.log(`- Post ID: ${p._id}`);
            console.log(`  Unknown media?: ${p.media}`);
            console.log(`  Text: ${p.text}`);
            console.log(`  isArchived: ${p.isArchived}`);
            console.log('---');
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkPosts();
