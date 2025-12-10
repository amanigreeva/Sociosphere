const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;

    // Get moni_01 and rishi_01 user IDs
    const moni = await db.collection('users').findOne({ username: 'moni_01' });
    const rishi = await db.collection('users').findOne({ username: 'rishi_01' });

    if (!moni || !rishi) {
        console.log('Users not found!');
        mongoose.disconnect();
        return;
    }

    console.log('moni_01 ID:', moni._id);
    console.log('rishi_01 ID:', rishi._id);

    // Check if conversation already exists
    const existing = await db.collection('conversations').findOne({
        members: { $all: [moni._id, rishi._id] },
        isGroup: false
    });

    if (existing) {
        console.log('Conversation already exists:', existing._id);
    } else {
        // Create new 1-on-1 conversation
        const result = await db.collection('conversations').insertOne({
            members: [moni._id, rishi._id],
            isGroup: false,
            deletedBy: [],
            lastMessage: { text: '', sender: '', timestamp: new Date() },
            unreadCount: {},
            createdAt: new Date(),
            updatedAt: new Date()
        });
        console.log('Created new conversation:', result.insertedId);
    }

    mongoose.disconnect();
}).catch(err => console.error(err));
