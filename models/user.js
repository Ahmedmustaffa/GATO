const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^@[a-zA-Z0-9_]+$/, // Ensures username starts with @ and contains only letters, numbers, and underscores
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true, // Allows null values while enforcing uniqueness
    trim: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ['Male', 'Female'],
    required: true,
  },
  profileImg: {
    type: String,
    default: 'http://localhost:3000/images/userIcon.svg', // Default profile photo URL
  },
  password: {
    type: String,
    required: true,
    minlength: 8, // Minimum password length
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post', // Reference to the Post model
    },
  ],
});

// Hash the password before saving the user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if the password is modified

  try {
    this.password = await bcrypt.hash(this.password, 12); // Hash the password
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.virtual('fullName').get(function () {
  return `${this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1)} ${this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1)}`;
});

// Ensure virtual fields are included in toJSON output
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);
module.exports = User;