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

const updateNames = async () => {
    await connectDB();

    try {
        // Moni - You (Sender in screenshot)
        // If image 1 shows a girl ("Active now"), assuming user wants to be the sender?
        // Wait, the user said "like this image". 
        // I'll just set robust names.

        // Moni 
        await User.updateOne(
            { username: 'moni_01' },
            { $set: { name: 'Moni Roy' } }
        );

        // Rishi - The Chat Partner
        await User.updateOne(
            { username: 'rishi_01' },
            { $set: { name: 'Krishna Chaithanya valaboju' } } // EXACT MATCH
        );
        console.log("Updated Rishi to Krishna Chaithanya valaboju");

    } catch (err) {
        console.error("Error updating:", err);
    } finally {
        mongoose.disconnect();
    }
};

updateNames();
