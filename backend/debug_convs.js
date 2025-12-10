const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;

    const moni = await db.collection('users').findOne({ username: 'moni_01' });
    console.log('moni_01 ID:', String(moni._id));

    // Get conversations with moni_01 as a member
    const convs = await db.collection('conversations').find({
        members: { $in: [moni._id] }
    }).toArray();

    console.log('Conversations for moni_01:', convs.length);
    convs.forEach((c, i) => {
        console.log(i + 1, '- isGroup:', c.isGroup, '| name:', c.name || 'N/A', '| members:', c.members.map(m => String(m)));
    });

    mongoose.disconnect();
}).catch(err => console.error(err));
