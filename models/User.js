const mongoose = require('mongoose');
const bcrypt = require('bcrypt.js');
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilepic: {
        type: String,
        default: '',
    },
    posts: {
        type: Array,
        default: [],
    },
});
userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    user.password = await bcrypt.hash(user.password, 8);
    next();
});
mongoose.model('User', userSchema);
