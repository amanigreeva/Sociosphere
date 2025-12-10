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

const updateDetails = async () => {
    await connectDB();

    try {
        // Update Rishi to be User_B fully
        await User.updateOne(
            { $or: [{ username: 'rishi_01' }, { username: 'User_B' }] }, // Match old or new in case of re-run
            {
                $set: {
                    name: 'User_B',
                    username: 'User_B', // Explicitly set username
                    profilePicture: "https://i.pinimg.com/736x/8f/c3/7b/8fc37b74b608a622588fbaa361485f32.jpg"
                }
            }
        );
        console.log("Updated Rishi to User_B (Name & Username) with Ben 10 avatar");

    } catch (err) {
        console.error("Error updating:", err);
    } finally {
        mongoose.disconnect();
    }
};

updateDetails();
