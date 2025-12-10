const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const restoreData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Restore Avatar
        const username = 'moni_01';
        const profilePicture = 'anii.jpg'; // Assuming this is the correct filename or URL from previous context

        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: { profilePicture: profilePicture } },
            { new: true }
        );

        if (user) {
            console.log(`Updated avatar for ${username} to ${profilePicture}`);
        } else {
            console.log(`User ${username} not found.`);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

restoreData();
