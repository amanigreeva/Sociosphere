const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
require('dotenv').config();

const seedActivity = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Find user moni_01
        const user = await User.findOne({ username: 'moni_01' });
        if (!user) {
            console.log('User moni_01 not found');
            return;
        }

        // 1. Create a Post and Archive it
        const archivedPost = await Post.create({
            userId: user._id,
            text: 'This is an archived post test',
            image: 'https://via.placeholder.com/150',
            isArchived: true
        });
        console.log('Created Archived Post:', archivedPost._id);

        // 2. Create a Reel (Video) and Archive it
        // Simulating video with .mp4 extension in media
        const archivedReel = await Post.create({
            userId: user._id,
            text: 'This is an archived reel test',
            media: ['https://www.w3schools.com/html/mov_bbb.mp4'],
            isArchived: true
        });
        console.log('Created Archived Reel:', archivedReel._id);

        // 3. Create a Post and Like it
        const likedPost = await Post.create({
            userId: user._id, // Owned by self, but let's make it owned by someone else? 
            // Actually, getLikedPosts searches for posts where likes array contains user._id
            // It can be own post or others.
            text: 'Post I Liked',
            image: 'https://via.placeholder.com/150',
            likes: [user._id]
        });
        console.log('Created Liked Post:', likedPost._id);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

seedActivity();
