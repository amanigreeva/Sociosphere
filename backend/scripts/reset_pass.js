const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const resetPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.findOneAndUpdate(
            { username: 'moni_01' },
            { password: hashedPassword }
        );
        console.log('Password for moni_01 reset to password123');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

resetPassword();
