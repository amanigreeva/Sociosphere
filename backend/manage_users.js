const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const manageUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Delete Users
        const usersToDelete = ['user_alpha', 'user_sigma', 'elon_musk'];
        const deleteResult = await User.deleteMany({ username: { $in: usersToDelete } });
        console.log(`Deleted ${deleteResult.deletedCount} users: ${usersToDelete.join(', ')}`);

        // 2. Add New Users
        const newUsers = [
            {
                name: 'Rishith',
                username: 'rishi_01',
                email: 'rishi@example.com',
                password: 'password123',
                profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
            },
            {
                name: 'David',
                username: 'david_01',
                email: 'david@example.com',
                password: 'password123',
                profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png'
            },
            {
                name: 'Sara',
                username: 'sara_01',
                email: 'sara@example.com',
                password: 'password123',
                profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135789.png'
            }
        ];

        for (const userData of newUsers) {
            // Check if user exists by username OR email
            const existingUser = await User.findOne({
                $or: [{ email: userData.email }, { username: userData.username }]
            });

            if (!existingUser) {
                const user = new User(userData);
                await user.save(); // Model middleware will hash password
                console.log(`Created user: ${userData.username}`);
            } else {
                console.log(`User ${userData.username} or ${userData.email} already exists.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

manageUsers();
