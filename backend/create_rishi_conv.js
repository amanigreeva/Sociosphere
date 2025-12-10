const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;

    const moni = await db.collection('users').findOne({ username: 'moni_01' });
    const rishi = await db.collection('users').findOne({ username: 'rishi_01' });

    console.log('moni:', moni?._id, moni?.username);
    console.log('rishi:', rishi?._id, rishi?.username);

    if (moni && rishi) {
        const existing = await db.collection('conversations').findOne({
            members: { $all: [moni._id, rishi._id] },
            isGroup: false
        });

        if (existing) {
            console.log('Already exists:', existing._id);
        } else {
            const r = await db.collection('conversations').insertOne({
                members: [moni._id, rishi._id],
                isGroup: false,
                deletedBy: [],
                lastMessage: {},
                unreadCount: {},
                createdAt: new Date(),
                updatedAt: new Date()
            });
            console.log('Created:', r.insertedId);
        }
    }

    mongoose.disconnect();
}).catch(err => console.error(err));
