const mongoose = require("mongoose");
const { connectDB, searchHistoryDB, loginRegisterDB, cropDataDB } = require('../db.js');
const cropDataSchema = new mongoose.Schema({
    location: { type: String, required: true },
    crop: { type: String, required: true },
    disease: { type: String, default: "N/A" },
    isDiseased: { type: String, enum: ["Yes", "No"], required: true },
    person: { type: String, required: true },
    category: { type: String, enum: ["Solution", "General"], required: true },
    suggestion: { type: String, default: "" },
    images: { type: [String], default: [] },
    date: { type: Date, default: Date.now }
}, { timestamps: true });


module.exports = cropDataDB.model('cropDataDB', cropDataSchema);
