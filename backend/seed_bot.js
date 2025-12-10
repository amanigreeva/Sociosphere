const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error(err));

const seedBot = async () => {
    try {
        const botName = 'Classic_AI';
        const existingBot = await User.findOne({ username: botName });

        if (existingBot) {
            console.log('Classic_AI already exists.');
            return;
        }

        const botUser = new User({
            username: botName,
            email: 'ai_classic@sociosphere.com',
            password: 'ai_password_secure_123', // Wont be used for login really
            name: 'Classic AI Bot',
            desc: 'I am a classic AI chatbot. Ask me anything!',
            profilePicture: 'https://cdn-icons-png.flaticon.com/512/4712/4712027.png', // Robot Icon
            city: 'The Cloud',
            from: 'Binary Void',
            isAdmin: false,
        });

        await botUser.save();
        console.log('Classic_AI user created successfully!');
    } catch (err) {
        console.error('Error seeding bot:', err);
    } finally {
        mongoose.disconnect();
    }
};

seedBot();
