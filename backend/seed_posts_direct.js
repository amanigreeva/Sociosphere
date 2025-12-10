const mongoose = require('mongoose');
const Post = require('./src/models/Post');
const User = require('./src/models/User');
require('dotenv').config();

// Sample data for each category
const samplePosts = {
    GYM: [
        { text: '💪 Morning workout complete! Chest and triceps day #fitness #gym', media: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800'] },
        { text: '🏋️ New PR on deadlifts! 200kg #powerlifting #strength', media: ['https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'] },
        { text: '🔥 Leg day is the best day! #neverskiplegday #workout', media: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'] },
    ],
    FOOD: [
        { text: '🍔 Homemade burger with fresh ingredients! #foodie #cooking', media: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'] },
        { text: '🍕 Pizza night! Made from scratch #homemade #pizza', media: ['https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800'] },
        { text: '🍰 Chocolate cake for dessert! #baking #dessert', media: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800'] },
    ],
    ACT: [
        { text: '🎭 Behind the scenes of our latest production! #acting #theater', media: ['https://images.unsplash.com/photo-1503095396549-807759245b35?w=800'] },
        { text: '🎬 Rehearsal time! Getting into character #performer #drama', media: ['https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800'] },
        { text: '🎪 Opening night energy! #broadway #performance', media: ['https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800'] },
    ],
    ART: [
        { text: '🎨 New painting in progress! Abstract vibes #art #painting', media: ['https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800'] },
        { text: '✨ Digital art creation #digitalart #design', media: ['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800'] },
        { text: '🖌️ Watercolor landscape #watercolor #artist', media: ['https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800'] },
    ],
    MOVIES: [
        { text: '🎬 Movie night! Watching classics #cinema #film', media: ['https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800'] },
        { text: '🍿 Behind the camera! Filmmaking process #director #production', media: ['https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'] },
        { text: '🎥 Editing the final cut! #postproduction #editing', media: ['https://images.unsplash.com/photo-1574267432644-f610a0f4f6c5?w=800'] },
    ],
    PRODUCTS: [
        { text: '📦 Unboxing the latest tech gadget! #unboxing #review', media: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'] },
        { text: '⌚ Smartwatch review! Features and performance #tech #gadgets', media: ['https://images.unsplash.com/photo-1523395243481-163f8f6155ab?w=800'] },
        { text: '🎧 Best headphones for music lovers! #audio #review', media: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'] },
    ],
    TECH: [
        { text: '💻 Coding setup tour! Developer workspace #programming #tech', media: ['https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800'] },
        { text: '🖥️ Building a new PC! RGB everything #pcgaming #build', media: ['https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800'] },
        { text: '📱 Latest smartphone features! #mobile #technology', media: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'] },
    ],
    GAMING: [
        { text: '🎮 Epic gaming session! New high score #gaming #esports', media: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800'] },
        { text: '🕹️ Retro gaming setup! Classic consoles #retrogaming #nostalgia', media: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800'] },
        { text: '🏆 Tournament victory! Team effort #competitive #gaming', media: ['https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800'] },
    ],
};

async function seedPostsDirectly() {
    try {
        console.log('🌱 Starting to seed posts directly to database...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB!\n');

        // Find a user to assign posts to (using moni_01)
        const user = await User.findOne({ username: 'moni_01' });
        if (!user) {
            console.error('❌ User moni_01 not found! Please create this user first.');
            process.exit(1);
        }
        console.log(`👤 Found user: ${user.username}\n`);

        // Create posts for each category
        let totalCreated = 0;
        for (const [category, posts] of Object.entries(samplePosts)) {
            console.log(`📝 Creating ${category} posts...`);

            for (const postData of posts) {
                try {
                    const post = await Post.create({
                        userId: user._id.toString(),
                        text: postData.text,
                        media: postData.media,
                        category: category
                    });
                    console.log(`  ✓ Created: ${postData.text.substring(0, 50)}...`);
                    totalCreated++;
                } catch (err) {
                    console.error(`  ✗ Failed: ${err.message}`);
                }
            }
            console.log('');
        }

        console.log('🎉 Seeding completed successfully!');
        console.log(`📊 Total posts created: ${totalCreated}/${Object.values(samplePosts).flat().length}`);

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding posts:', error.message);
        process.exit(1);
    }
}

// Run the seeder
seedPostsDirectly();
