const express = require('express');
const User = require('../models/User'); // Import User model
const router = express.Router();

router.get('/:id', async (req, res) => {
    if (!req.session.user || req.session.user._id.toString() !== req.params.id) {
        return res.redirect('/auth/login');
    }

    try {
        const user = await User.findById(req.params.id).select('name contact role');
        if (!user) {
            return res.status(404).send("User not found");
        }
    res.render('dashboard', { user });
    } catch (err) {
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
