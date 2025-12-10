const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const username = 'moni_01';
        const user = await User.findOne({ username }).select('+password');

        if (!user) { console.log('User not found'); return; }

        console.log(`Resetting password for: ${user.username}`);
        user.password = 'moni@123';
        await user.save();

        console.log('Password reset to: moni@123');

    } catch (err) { console.error(err); }
    finally { await mongoose.disconnect(); process.exit(); }
};

resetPassword();
