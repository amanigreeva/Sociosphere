const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected to: ${process.env.MONGO_URI.replace(/:.*@/, ':****@')}`); // Hide creds

        const username = 'moni_01';
        const password = 'moni@123';

        const user = await User.findOne({ username }).select('+password');

        if (!user) {
            console.log('User not found');
            return;
        }

        console.log(`User found: ${user.username}`);
        console.log(`Stored Hash: ${user.password}`);

        const isMatch = await user.matchPassword(password);
        console.log(`Login check for '${password}': ${isMatch ? 'PASSED' : 'FAILED'}`);

    } catch (err) { console.error(err); }
    finally { await mongoose.disconnect(); process.exit(); }
};

testLogin();
