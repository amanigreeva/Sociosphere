const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const createSafeUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const users = [
            { username: 'alice_wonder', email: 'alice@test.com', name: 'Alice Wonderland' },
            { username: 'bob_builder', email: 'bob@test.com', name: 'Bob The Builder' }
        ];

        for (const u of users) {
            const exists = await User.findOne({ email: u.email });
            if (!exists) {
                const newUser = new User({
                    username: u.username,
                    email: u.email,
                    password: hashedPassword,
                    name: u.name,
                    profilePicture: `https://ui-avatars.com/api/?name=${u.name.replace(' ', '+')}&background=random`
                });
                await newUser.save();
                console.log(`Created: ${u.username}`);
            } else {
                console.log(`Exists: ${u.username}`);
            }
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createSafeUsers();
