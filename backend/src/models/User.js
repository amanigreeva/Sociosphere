// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minLength: 3,
      maxLength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
      minLength: 6,
    },
    profilePicture: {
      type: String,
      default: '/assets/logo.png',
    },
    coverPicture: {
      type: String,
      default: '',
    },
    followers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    following: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    savedPosts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Post',
      default: [],
    },
    desc: {
      type: String,
      maxLength: 150,
      default: '',
    },
    city: {
      type: String,
      maxLength: 50,
      default: '',
    },
    from: {
      type: String,
      maxLength: 50,
      default: '',
    },
    relationship: {
      type: Number,
      enum: [1, 2, 3], // 1: Single, 2: Married, 3: Other
      default: 1,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;