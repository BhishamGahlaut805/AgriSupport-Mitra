const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Weather-page
router.get('/weatherDisplay', (req, res) => {
    res.render('weather');
});
router.get('/weatherDetail', (req, res) => {
    res.render('weatherReport');
});

//news page
router.get('/news', (req, res) => {
    res.render('news');
});
router.get('/newsdetail', async (req, res) => {
    const link = req.query.link;

    if (!link) {
        return res.status(400).send('No link provided');
    }

    try {
        const response = await axios.post('http://127.0.0.1:5000/newsdetail', { link });
        const data = response.data;

        // Render the 'news_detail' view with the headline, paragraphs, and figure
        res.render('news_detail', {
            headline: data.headline, // Include the headline data
            paragraphs: data.paragraphs,
            figure: data.figure // The image (figure)
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Error fetching news details');
    }
});




// Route to handle form submissions
router.post('/search-location', (req, res) => {
    console.log('Received body:', req.body); // Debugging

    const location2 = req.body.location2;

    if (location2 === '') {
        return res.status(400).json({ message: 'Location is required!' });
    }

    res.status(200).json({ message: `Search initiated for location: ${location2}`, location2 });
});

router.post('/generateGraph', async (req, res) => {
    // console.log('Received body:', req.body); // Debugging
    try {
        // The data from the client
        const data = req.body;

        // Send data to the Python Flask API (which generates the graph)
        const response = await axios.post('http://127.0.0.1:5000/generateGraph', data, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer', // Receive the image as an array buffer
        });

        // Check if the response is valid
        if (response.status === 200) {
            // Send the image back to the client
            res.set('Content-Type', 'image/png');
            res.send(response.data); // This sends the image binary data to the client
        } else {
            res.status(500).send('Error generating graph from Python');
        }

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to generate graphs');
    }
});


router.post('/generateSeasonal', async (req, res) => {
    // console.log('Received body:', req.body); // Debugging
    try {
        // The data from the client
        const data = req.body;

        // Send data to the Python Flask API (which generates the graph)
        const response = await axios.post('http://127.0.0.1:5000/generateSeasonal', data, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer', // Receive the image as an array buffer
        });

        // Check if the response is valid
        if (response.status === 200) {
            // Send the image back to the client
            res.set('Content-Type', 'image/png');
            res.send(response.data); // This sends the image binary data to the client
        } else {
            res.status(500).send('Error generating graph from Python');
        }

    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to generate graphs');
    }
});



module.exports = router;
