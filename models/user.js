const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, lowercase: true, trim: true },
    password: { type: String, },
    mobile: Number,
    profile_pic: String,
    profile: String,
    userId: { type: String, default: null }
});

module.exports = mongoose.model('user', userSchema);