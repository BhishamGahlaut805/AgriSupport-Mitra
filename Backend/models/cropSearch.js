const mongoose = require("mongoose");
const { connectDB, searchHistoryDB, loginRegisterDB } = require('../db.js');
// const { connect } = require("http2");
// connectDB();
const searchSchema = new mongoose.Schema({
    username: { type: String, required: true },
    crop: { type: String, required: true },
    disease: { type: String, required: true },
    confidence: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }  // ✅ Auto-generate timestamp
});

module.exports = searchHistoryDB.model("SearchHistoryDB", searchSchema);

