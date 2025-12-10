const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const resetAlpha = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({ username: 'user_alpha' });
        if (!user) {
            console.log('user_alpha NOT FOUND. Creating...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            const newUser = new User({
                username: 'user_alpha',
                email: 'alpha@test.com',
                password: hashedPassword,
                name: 'Alpha User',
                profilePicture: 'https://ui-avatars.com/api/?name=Alpha+User&background=0D8ABC&color=fff'
            });
            await newUser.save();
            console.log('user_alpha created.');
        } else {
            console.log('user_alpha FOUND. Resetting password...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            user.password = hashedPassword;
            await user.save();
            console.log('user_alpha password reset.');
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetAlpha();
