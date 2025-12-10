const mongoose = require('mongoose');

// Connection string from .env (hardcoded here to ensure it works inside container)
const MONGO_URI = 'mongodb://mongo:27017/sociosphere';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('Connected to DB for migration');

        const collection = mongoose.connection.collection('posts');
        const cursor = collection.find({});

        let count = 0;
        while (await cursor.hasNext()) {
            const doc = await cursor.next();
            // Check if userId exists and is a string
            if (doc.userId && typeof doc.userId === 'string') {
                try {
                    const newId = new mongoose.Types.ObjectId(doc.userId);
                    await collection.updateOne(
                        { _id: doc._id },
                        { $set: { userId: newId } }
                    );
                    count++;
                    console.log(`Updated post ${doc._id}: userId converted to ObjectId`);
                } catch (e) {
                    console.error(`Failed to convert userId for post ${doc._id}: ${doc.userId}`, e);
                }
            }
        }

        console.log(`Migration complete. Updated ${count} posts.`);
        await mongoose.connection.close();
        process.exit(0);
    })
    .catch(err => {
        console.error('Migration failed connection:', err);
        process.exit(1);
    });
