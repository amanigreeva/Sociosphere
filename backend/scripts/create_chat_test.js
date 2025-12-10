const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./src/models/User');
require('dotenv').config();

const createChat = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const moni = await User.findOne({ username: 'moni_01' });
        const rishi = await User.findOne({ username: 'rishi_01' });

        if (!moni || !rishi) {
            console.log("Users not found");
            return;
        }

        console.log(`Creating chat between ${moni.username} (${moni._id}) and ${rishi.username} (${rishi._id})`);

        // We can't use axios directly to localhost:5000 easily if auth is required? 
        // Wait, conversation creation might not need auth if we hit the controller logic or DB directly?
        // The API route /api/conversations IS protected.
        // Instead, let's just create it in DB directly to be absolutely sure.

        const Conversation = require('./src/models/Conversation');
        let conv = await Conversation.findOne({
            members: { $all: [moni._id.toString(), rishi._id.toString()] }
        });

        if (!conv) {
            conv = new Conversation({
                members: [moni._id.toString(), rishi._id.toString()]
            });
            await conv.save();
            console.log("New conversation created manually in DB.");
        } else {
            console.log("Conversation already exists.");
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

createChat();
