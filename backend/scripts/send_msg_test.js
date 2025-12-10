const mongoose = require('mongoose');
const axios = require('axios');
const User = require('./src/models/User');
const Conversation = require('./src/models/Conversation');
const Message = require('./src/models/Message'); // Ensure model exists? using axios primarily but accessing DB to get IDs
require('dotenv').config();

const sendMessage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const moni = await User.findOne({ username: 'moni_01' });
        const rishi = await User.findOne({ username: 'rishi_01' });

        if (!moni || !rishi) {
            console.log("Users not found");
            return;
        }

        let conv = await Conversation.findOne({
            members: { $all: [moni._id.toString(), rishi._id.toString()] }
        });

        if (!conv) {
            console.log("No conversation found, creating...");
            conv = await Conversation.create({
                members: [moni._id.toString(), rishi._id.toString()]
            });
        }

        console.log(`Sending message to Conversation ${conv._id}`);

        // Directly create message in DB to be 100% sure
        const newMsg = new Message({
            conversationId: conv._id,
            sender: moni._id,
            text: "hello"
        });
        await newMsg.save();

        console.log("Message 'hello' sent successfully (DB Direct).");

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
};

sendMessage();
