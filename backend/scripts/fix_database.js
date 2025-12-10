const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const fixDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find();
        console.log(`Found ${users.length} users. Checking for invalid references...`);

        for (const user of users) {
            let changed = false;

            // Check following
            const validFollowing = [];
            for (const id of user.following) {
                const exists = await User.findById(id);
                if (exists) {
                    validFollowing.push(id);
                } else {
                    console.log(`User ${user.username}: Removing invalid following ID ${id}`);
                    changed = true;
                }
            }

            // Check followers
            const validFollowers = [];
            for (const id of user.followers) {
                const exists = await User.findById(id);
                if (exists) {
                    validFollowers.push(id);
                } else {
                    console.log(`User ${user.username}: Removing invalid follower ID ${id}`);
                    changed = true;
                }
            }

            if (changed) {
                user.following = validFollowing;
                user.followers = validFollowers;
                await user.save();
                console.log(`Updated user ${user.username}`);
            }
        }

        console.log('Database cleanup complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error cleaning database:', error);
        process.exit(1);
    }
};

fixDatabase();
