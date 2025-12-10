const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    text: {
        type: String,
        max: 500,
    },
    media: {
        type: Array,
        default: [],
    },
    image: {
        type: String,
    },
    likes: {
        type: Array,
        default: [],
    },
    comments: [
        {
            userId: {
                type: String,
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            username: {
                type: String,
                required: true,
            },
            avatar: {
                type: String,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    category: {
        type: String,
        enum: ['ALL', 'GYM', 'FOOD', 'ACT', 'ART', 'MOVIES', 'PRODUCTS', 'TECH', 'GAMING', 'OTHER'],
        default: 'OTHER',
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
