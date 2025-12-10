const mongoose = require('mongoose');
const User = require('./src/models/User');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    }
};

const updateAvatars = async () => {
    await connectDB();

    try {
        // Moni - Female Avatar
        await User.updateOne(
            { username: 'moni_01' },
            { $set: { profilePicture: 'https://cdn-icons-png.flaticon.com/512/6858/6858504.png' } }
        );
        console.log("Updated moni_01 avatar");

        // Rishi - Male Avatar
        await User.updateOne(
            { username: 'rishi_01' },
            { $set: { profilePicture: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' } }
        );
        console.log("Updated rishi_01 avatar");

    } catch (err) {
        console.error("Error updating:", err);
    } finally {
        mongoose.disconnect();
    }
};

updateAvatars();
