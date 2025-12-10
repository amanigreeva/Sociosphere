const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const clearFollowing = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ username: 'moni_01' });
        if (user) {
            user.following = [];
            await user.save();
            console.log('Cleared following for moni_01');
        } else {
            console.log('moni_01 not found');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

clearFollowing();
