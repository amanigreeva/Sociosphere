const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;

    // Clear deletedBy for all conversations
    const result = await db.collection('conversations').updateMany(
        {},
        { $set: { deletedBy: [] } }
    );

    console.log('Cleared deletedBy for', result.modifiedCount, 'conversations');

    const convs = await db.collection('conversations').find({}).toArray();
    console.log('Total conversations now:', convs.length);

    mongoose.disconnect();
}).catch(err => console.error(err));
