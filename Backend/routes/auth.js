const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User'); // Import User model
const router = express.Router();

// Render Login Page
router.get('/login', (req, res) => {
    res.render('login', { inf: "Login Here to Continue" });
});

// Registration Route
router.post('/register', async (req, res) => {
    const { name,Address, contactType, contact, role, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.render('login', { inf: "Passwords do not match." });
    }

    try {
        const existingUser = await User.findOne({ contact });
        if (existingUser) {
            return res.render('login', { inf: "User already exists. Please login." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ name,Address, contactType, contact, password: hashedPassword, role });
        await newUser.save();

        res.render('login', { inf: "Registration successful. You can log in now." });
    } catch (err) {
        res.render('login', { inf: "Error registering user. Please try again." });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { contact, password } = req.body;

    try {
        const user = await User.findOne({ contact });
        if (!user) {
            return res.render('login', { inf: "User not found. Please register." });
        }

        const isPassValid = await bcrypt.compare(password, user.password);
        if (!isPassValid) {
            return res.render('login', { inf: "Invalid contact or password." });
        }

        req.session.user = user;
        res.redirect(`/dashboard/${user._id}`);
    } catch (err) {
        res.render('login', { inf: "Error logging in. Please try again." });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.redirect('/dashboard'); // In case of error, just redirect to dashboard
        }
        res.redirect('/auth/login'); // Redirect to login page after session is destroyed
    });
});
// Forgot Password Route
router.post('/forgot-password', async (req, res) => {
    const { contact } = req.body;

    try {
        const user = await User.findOne({ contact });
        if (!user) {
            return res.status(404).render('login', { inf: "User not found." });
        }

        // Generate a reset token and set its expiry
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes validity

        user.resetToken = resetToken;
        user.resetExpires = resetExpires;
        await user.save();

        // Send the token back to the frontend
        return res.render("reset", { resetToken });  // Ensure resetToken is passed here
    } catch (err) {
        console.error("Error during password reset request:", err);
        res.status(500).json({ inf: "Error during password reset request." });
    }
});

// Reset Password Route
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { new_password, confirm_new_password, resetToken } = req.body;

    // Ensure the token in the URL matches the one in the body
    if (token !== resetToken) {
        return res.status(400).render('reset', { inf: "Invalid or mismatched reset token." });
    }

    // Ensure passwords match
    if (new_password !== confirm_new_password) {
        return res.status(400).render('reset', { inf: "Passwords do not match." });
    }

    try {
        // Validate the reset token and expiration
        const user = await User.findOne({
            resetToken: token,
            resetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).render('reset', { inf: "Invalid or expired reset token.", resetToken });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update user's password and clear the reset token and expiry
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetExpires = undefined;
        await user.save();

        res.render('login', { inf: "Password successfully reset. You can now login." });
    } catch (err) {
        console.error("Error resetting password:", err);
        res.status(500).render('login', { inf: "Error resetting password. Please try again." });
    }
});


module.exports = router;


