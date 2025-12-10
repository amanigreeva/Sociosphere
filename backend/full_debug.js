const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const db = mongoose.connection.db;

    console.log('=== ALL USERS ===');
    const users = await db.collection('users').find({}).toArray();
    users.forEach(u => console.log(u._id.toString(), '-', u.username));

    console.log('\n=== ALL CONVERSATIONS ===');
    const convs = await db.collection('conversations').find({}).toArray();
    convs.forEach((c, i) => {
        console.log('\n' + (i + 1) + '. ID:', c._id.toString());
        console.log('   isGroup:', c.isGroup);
        console.log('   name:', c.name || 'N/A');
        console.log('   members:', c.members.map(m => String(m)));
        console.log('   deletedBy:', c.deletedBy);
    });

    mongoose.disconnect();
}).catch(err => console.error(err));
