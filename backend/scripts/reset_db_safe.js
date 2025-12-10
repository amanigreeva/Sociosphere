const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Notification = require('./src/models/Notification');
const bcrypt = require('bcryptjs');

dotenv.config();

const cleanAndSeed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear all data
        await User.deleteMany({});
        await Post.deleteMany({});
        await Notification.deleteMany({});
        console.log('Database cleared');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { username: 'user_alpha', email: 'alpha@test.com', name: 'User Alpha', isAdmin: true },
            { username: 'user_beta', email: 'beta@test.com', name: 'User Beta' },
            { username: 'alice_wonder', email: 'alice@test.com', name: 'Alice Wonderland' },
            { username: 'bob_builder', email: 'bob@test.com', name: 'Bob The Builder' },
            { username: 'charlie_chaplin', email: 'charlie@test.com', name: 'Charlie Chaplin' },
            { username: 'david_beckham', email: 'david@test.com', name: 'David Beckham' },
            { username: 'elon_musk', email: 'elon@test.com', name: 'Elon Musk' },
        ];

        for (const u of users) {
            const newUser = new User({
                username: u.username,
                email: u.email,
                password: 'password123', // Let the model handle hashing
                name: u.name,
                isAdmin: u.isAdmin || false,
                profilePicture: `https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}&background=random`
            });
            await newUser.save();
            console.log(`Created user: ${u.username}`);
        }

        console.log('Database re-seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanAndSeed();
