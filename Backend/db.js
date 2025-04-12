const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/'; // Use a primary DB

async function connectDB() {
    try {
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Failed to connect to MongoDB', err);
        process.exit(1);
    }
}

// Call this once in your app entry point
connectDB();

// Create separate connections for other databases
const searchHistoryDB = mongoose.connection.useDb('SearchHistoryDB');
const loginRegisterDB = mongoose.connection.useDb('loginRegisterDB');
const cropDataDB = mongoose.connection.useDb('cropDataDB');

module.exports = {connectDB, searchHistoryDB, loginRegisterDB, cropDataDB};
