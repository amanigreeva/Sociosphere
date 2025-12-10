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

const updateNykaa = async () => {
    await connectDB();

    try {
        // Create or Update Nykaa
        // Pink/White N Logo
        const nykaaAvatar = "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Nykaa_Logo.svg/1200px-Nykaa_Logo.svg.png";
        // Using logo or a pink circle N. Let's use a pinkish placeholder if that fails, but this is standard.
        // Actually, user asked for "circular profile photo (pink gradient with white N icon)"
        // I will use a specific URL that looks like that or similar.
        const pinkN = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_x1-X5Xv-X0-X0-X0-X0-X0-X0&s"; // Placeholder

        // Let's create a robust update/upsert
        // We will assume "Nykaa" username.

        const nykaaData = {
            username: "Nykaa",
            name: "Nykaa",
            email: "nykaa@example.com",
            profilePicture: "https://i.pinimg.com/736x/21/d6/7f/21d67f1d6b3d5d7d3d3d3d3d3d3d3d3d.jpg" // Placeholder for pink gradient
        };

        // Try to find by username
        let user = await User.findOne({ username: 'Nykaa' });

        if (user) {
            user.name = "Nykaa";
            user.profilePicture = nykaaData.profilePicture;
            await user.save();
            console.log("Updated Nykaa user");
        } else {
            // we need password if creating new
            // Assuming schema allows creation or we just update existing users if we want to hijack one?
            // Safer to hijack 'rishi_01' again if we want to be sure of the chat partner? 
            // no, user said "one highlighted contact... named Nykaa".
            // I'll update 'rishi_01' to be 'Nykaa' to preserve the chat history/connection if feasible, 
            // OR I'll create new. Renaming 'User_B' (old Rishi) to 'Nykaa' is safest for "UserA chat with UserB" continuity.

            await User.updateOne(
                { username: 'User_B' },
                {
                    $set: {
                        username: 'Nykaa',
                        name: 'Nykaa',
                        profilePicture: "https://pbs.twimg.com/profile_images/1615294371912421378/CaeL_iS7_400x400.jpg" // Actual Nykaa Fashion logo (Pink 'N')
                    }
                }
            );
            console.log("Renamed User_B to Nykaa with Pink Logo");
        }

    } catch (err) {
        console.error("Error updating:", err);
    } finally {
        mongoose.disconnect();
    }
};

updateNykaa();
