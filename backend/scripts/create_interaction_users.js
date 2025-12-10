const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const createInteractionUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // We do NOT hash here because User model pre-save hook handles it
        const users = [
            { username: 'user_alpha', email: 'alpha@test.com', name: 'Alpha User', profilePicture: 'https://ui-avatars.com/api/?name=Alpha+User&background=0D8ABC&color=fff' },
            { username: 'user_beta', email: 'beta@test.com', name: 'Beta User', profilePicture: 'https://ui-avatars.com/api/?name=Beta+User&background=random' }
        ];

        for (const u of users) {
            // Delete if exists to ensure clean state
            await User.deleteOne({ email: u.email });
            await User.deleteOne({ username: u.username });

            const newUser = new User({
                username: u.username,
                email: u.email,
                password: 'password123', // Dictionary password, pre-save will hash
                name: u.name,
                profilePicture: u.profilePicture,
                followers: [],
                following: []
            });
            await newUser.save();
            console.log(`Created clean user: ${u.username}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createInteractionUsers();
