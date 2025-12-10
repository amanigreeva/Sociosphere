const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { username: 'alice_wonder', email: 'alice@test.com', name: 'Alice Wonderland' },
            { username: 'bob_builder', email: 'bob@test.com', name: 'Bob The Builder' },
            { username: 'charlie_chaplin', email: 'charlie@test.com', name: 'Charlie Chaplin' },
            { username: 'david_beckham', email: 'david@test.com', name: 'David Beckham' },
            { username: 'elon_musk', email: 'elon@test.com', name: 'Elon Musk' },
            { username: 'steve_jobs', email: 'steve@test.com', name: 'Steve Jobs' },
        ];

        for (const u of users) {
            const newUser = new User({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                name: u.name,
                profilePicture: `https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}&background=random`
            });
            await newUser.save();
            console.log(`Created user: ${u.username}`);
        }

        console.log('Test users created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating users:', error);
        process.exit(1);
    }
};

createUsers();
