const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
require('dotenv').config();

const debugQuery = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ username: 'moni_01' });

        const countAll = await Post.countDocuments({ userId: user._id });
        const countArchived = await Post.countDocuments({ userId: user._id, isArchived: true });
        const countVisible = await Post.countDocuments({ userId: user._id, isArchived: false });

        console.log(`TOTAL: ${countAll}`);
        console.log(`ARCHIVED: ${countArchived}`);
        console.log(`VISIBLE: ${countVisible}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

debugQuery();
