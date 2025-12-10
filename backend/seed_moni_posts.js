const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Post = require('./src/models/Post');

dotenv.config();

const categories = ['GYM', 'FOOD', 'ACT', 'ART', 'MOVIES', 'PRODUCTS', 'TECH', 'GAMING', 'OTHER'];
const POSTS_PER_CATEGORY = 3;

const categoryData = {
    GYM: [
        { text: "Crushed my morning workout! 💪 New personal best on deadlifts.", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop" },
        { text: "Consistency is key. 🏋️‍♀️ Day 45 of the challenge.", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop" },
        { text: "Post-workout meal prep. Fueling the body! 🥗", image: "https://images.unsplash.com/photo-1540497077202-7c8a33801524?w=500&auto=format&fit=crop" }
    ],
    FOOD: [
        { text: "Homemade pasta night! 🍝 Tastes so much better than store-bought.", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&auto=format&fit=crop" },
        { text: "Exploring the best tacos in the city. 🌮🔥", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop" },
        { text: "Sunday brunch vibes. 🥞☕", image: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=500&auto=format&fit=crop" }
    ],
    ACT: [
        { text: "Rehearsing lines for the new play. 🎭 The drama is real!", image: "https://images.unsplash.com/photo-1503095392237-fc785870c5c6?w=500&auto=format&fit=crop" },
        { text: "Behind the scenes on set. 🎬 Lights, camera, action!", image: "https://images.unsplash.com/photo-1496337589254-7e19d01cec44?w=500&auto=format&fit=crop" },
        { text: "Improv night with the crew! So many laughs. 😂", image: "https://images.unsplash.com/photo-1533147670608-2a2ef77d3a75?w=500&auto=format&fit=crop" }
    ],
    ART: [
        { text: "Working on a new landscape piece. 🎨 Oil on canvas.", image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=500&auto=format&fit=crop" },
        { text: "Visited the modern art museum today. So inspiring. 🖼️", image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&auto=format&fit=crop" },
        { text: "Sketching in the park. ✏️ Nature is the best muse.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&auto=format&fit=crop" }
    ],
    MOVIES: [
        { text: "Just watched the latest sci-fi blockbuster. 🍿 Mind blown!", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop" },
        { text: "Classic movie marathon weekend. 🎥 What's your favorite classic?", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop" },
        { text: "Analyzing the cinematography of Dune. 🎞️ Masterpiece.", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&auto=format&fit=crop" }
    ],
    PRODUCTS: [
        { text: "Unboxing the new mechanical keyboard! ⌨️ The click is satisfying.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop" },
        { text: "Reviewing these noise-canceling headphones. 🎧 Silence is golden.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop" },
        { text: "My everyday carry setup. 🎒 Minimalism ftw.", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&auto=format&fit=crop" }
    ],
    TECH: [
        { text: "Coding late into the night. 💻 Fixing bugs.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop" },
        { text: "Everything is moving to the cloud. ☁️ Tech trends 2025.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop" },
        { text: "Building my first AI model! 🤖 Check out the progress.", image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=500&auto=format&fit=crop" }
    ],
    GAMING: [
        { text: "Victory royale! 🏆 That final circle was intense.", image: "https://images.unsplash.com/photo-1552820728-8b83bb6fa929?w=500&auto=format&fit=crop" },
        { text: "The graphics on this new RPG are insane. 🎮✨", image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop" },
        { text: "Lan party with the squad. 🕹️ Nostalgia weekend.", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&auto=format&fit=crop" }
    ],
    OTHER: [
        { text: "Just a beautiful sunset to end the day. 🌅", image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=500&auto=format&fit=crop" },
        { text: "Reading a book by the fireplace. 📖 Cozy vibes.", image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500&auto=format&fit=crop" },
        { text: "Travel bucket list update! ✈️ Where to next?", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&auto=format&fit=crop" }
    ]
};

const seedPosts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        // Find the user 'moni_01' or 'moni'
        let user = await User.findOne({ username: 'moni_01' });
        if (!user) {
            user = await User.findOne({ username: 'moni' });
        }

        if (!user) {
            console.error('User "moni" or "moni_01" not found! Please create the user first.');
            process.exit(1);
        }

        console.log(`Found user: ${user.username} (${user._id})`);

        // OPTIONAL: Clean up previous generic posts to avoid duplicates/clutter
        const deleteResult = await Post.deleteMany({ userId: user._id, text: { $regex: /^This is a sample post #/ } });
        console.log(`Deleted ${deleteResult.deletedCount} previous sample posts.`);

        const postsToInsert = [];

        for (const [category, posts] of Object.entries(categoryData)) {
            console.log(`Generating unique posts for category: ${category}`);
            posts.forEach(postData => {
                postsToInsert.push({
                    userId: user._id,
                    text: postData.text,
                    category: category,
                    media: [postData.image],
                    likes: [],
                    comments: []
                });
            });
        }

        if (postsToInsert.length > 0) {
            await Post.insertMany(postsToInsert);
            console.log(`Successfully seeded ${postsToInsert.length} UNIQUE posts!`);
        } else {
            console.log('No posts to insert.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding posts:', error);
        process.exit(1);
    }
};

seedPosts();
