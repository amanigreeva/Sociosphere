const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const updateProfilePics = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Update logic: set profilePicture to /assets/logo.png where it is currently /assets/person/noAvatar.png or null/undefined
        // Note: Using updateMany to efficienty update all matching documents
        const result = await User.updateMany(
            {
                $or: [
                    { profilePicture: '/assets/person/noAvatar.png' },
                    { profilePicture: { $exists: false } },
                    { profilePicture: null },
                    { profilePicture: '' }
                ]
            },
            { $set: { profilePicture: '/assets/logo.png' } }
        );

        console.log(`Updated ${result.modifiedCount} users to use default app logo.`);

        // Optional: List a few updated users to verify
        // const updatedUsers = await User.find({ profilePicture: '/assets/logo.png' }).limit(5);
        // console.log('Sample updated users:', updatedUsers.map(u => u.username));

        process.exit(0);
    } catch (err) {
        console.error('Error updating profile pictures:', err);
        process.exit(1);
    }
};

updateProfilePics();
