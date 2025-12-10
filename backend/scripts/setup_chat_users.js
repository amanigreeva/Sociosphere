const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Use MONGO_URI from env
        console.log("Connected to DB");

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        const users = [
            { username: "moni_01", email: "moni@example.com", password: hashedPassword },
            { username: "rishi_01", email: "rishi@example.com", password: hashedPassword }
        ];

        for (const u of users) {
            let user = await User.findOne({ username: u.username });
            if (!user) {
                user = await User.create(u);
                console.log(`Created ${u.username}`);
            } else {
                console.log(`${u.username} exists`);
            }
        }

        // Ensure they follow each other (friends)
        const moni = await User.findOne({ username: "moni_01" });
        const rishi = await User.findOne({ username: "rishi_01" });

        if (!moni.following.includes(rishi._id)) {
            moni.following.push(rishi._id);
            rishi.followers.push(moni._id);
            await moni.save();
            await rishi.save();
            console.log("Moni follows Rishi");
        }

        if (!rishi.following.includes(moni._id)) {
            rishi.following.push(moni._id);
            moni.followers.push(rishi._id);
            await rishi.save();
            await moni.save();
            console.log("Rishi follows Moni");
        }

        console.log("Setup Complete");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createUsers();
