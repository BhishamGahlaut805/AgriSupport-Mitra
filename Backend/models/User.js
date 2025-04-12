const mongoose = require('mongoose');
const { connectDB, searchHistoryDB, loginRegisterDB ,cropDataDB} = require('../db.js');
const userSchema = new mongoose.Schema({
    name: String,
    Address: String,
    contactType: { type: String, enum: ['email', 'mobile'], required: true },
    contact: { type: String, required: true, unique: true },
    password: String,
    role: { type: String, enum: ['farmer', 'trader', 'other'], required: true },
    otp: String,
    otpExpires: Date,

    resetToken: {
        type: String
    },
    resetExpires: {
        type: Date
    }
});

module.exports = loginRegisterDB.model('User', userSchema);
