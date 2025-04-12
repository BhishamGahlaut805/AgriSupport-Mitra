const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const path=require('path');
const app = express();
const port = 3000;
const chatbot=require('./routes/Chatbot');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
    })
);
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Failed to connect to MongoDB', err));

// Middleware to set global variables for views
app.use((req, res, next) => {
    if (req.session.user) {
        res.locals.nameOfuser = req.session.user.name;
        res.locals.userId = req.session.user._id;
    } else {
        res.locals.nameOfuser = 'Guest';
        res.locals.userId = null;
    }
    res.locals.isAuthenticated = !!req.session.user;
    next();
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.render('main');
});
app.get('/login&registration', (req, res) => {
    res.redirect('/auth/login');
});
app.get('/Contact/us', (req, res) => {
    res.render('Contact');
});


// Weather data route
const weatherRoutes = require('./routes/weatherServer');
app.use('/weather', weatherRoutes);

// Crop monitoring data route
const cropMonitoringRoutes = require('./routes/cropMonitoring');
app.use('/cropMonitoring', cropMonitoringRoutes);
app.use('/chatbot',chatbot);

app.get('/map', (req, res) => {
    res.render('map');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
