const express = require('express');
const axios = require('axios');
const router = express.Router();
// const fs = require('fs');
const path = require('path');
const SearchHistory = require('../models/cropSearch');
const upload = require("../middlewares/upload");
const CropData = require('../models/cropData');
const User = require("../models/User"); // Adjust the path as needed
const puppeteer = require('puppeteer');

const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // ✅ Correct import
require("dotenv").config();
const cors = require("cors");

router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// ✅ Initialize Gemini API
// const apiKey = process.env.GENERATIVE_API_KEY;
const apiKey = "KEY4";
console.log("✅ Using API Key:", apiKey);

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });


// router.use(bodyParser.json());

// const mongoose = require('mongoose');
// Weather-page
router.get('/Crop', (req, res) => {

    res.render('smartMonitoring');
});

//Disease Predictions
router.get('/Crop/DiseasePrediction', (req, res) => {
    res.render('cropDisease');
});
router.post("/api/save-search", async (req, res) => {
    try {
        const { username, crop, disease, confidence, imageUrl } = req.body;
        console.log("Data received to make DB:", username, crop, disease, confidence, imageUrl);

        // ✅ Validate Required Fields
        if (!crop || !disease || confidence == null || !imageUrl) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const newSearch = new SearchHistory({
            username,
            crop,
            disease,
            confidence,
            imageUrl
        });

        // ✅ Fetch User Data Before Saving Crop Data
        if (disease.toLowerCase() !== "healthy") {
            let isDiseased = "Yes";

            try {
                // 🔹 Fetch user details from the database
                const user = await User.findOne({name:username });

                if (user=="") {
                    console.error("User not found in UserDB!");
                    return res.status(404).json({ success: false, message: "User not found" }); // Send error response
                }

                //  Extract User's Location & Name
                const location = user.Address
; // Default if no location found
                const person =  username; // Store actual user name from UserDB
                const suggestion = "";
                const date = Date.now();
                const category = "General";

                // 🔹 Save Data to CommunityDB
                const newCropData = new CropData({
                    location,
                    crop,
                    disease,
                    isDiseased,
                    person,
                    category,
                    suggestion,
                    images: [imageUrl], // ✅ Ensure it's an array
                    date
                });

                await newCropData.save();
                console.log("✅ Crop data saved successfully!");

            } catch (error) {
                console.error("❌ Error fetching user data:", error);
                return res.status(500).json({ success: false, message: "Error fetching user data" });
            }
        }

        await newSearch.save();
        console.log("✅ Search Saved:", newSearch);

        res.json({ success: true, message: "Search saved successfully!", data: newSearch });

    } catch (error) {
        console.error("❌ MongoDB Save Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


router.get("/api/get-searches/:username", async (req, res) => {
    try {
        const username = req.params.username;
        if (username=="") {
            return res.status(400).json({ success: false, message: "Username is required" });
        }

        // const username = res.locals.nameOfuser; // ✅ Get username from session

        const searches = await SearchHistory.find({ username })
            .sort({ timestamp: -1 })  // ✅ Show latest searches first
            .limit(10);

        res.json({ success: true, data: searches });

    } catch (error) {
        console.error("❌ MongoDB Fetch Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
router.get("/api/get-username", (req, res) => {
    // if (req.session.user.name == "" || res.locals.nameOfuser == "" ) {
    //     return res.json({ username: null });
    // }
    // res.json({ username: req.session.user.name || res.locals.nameOfuser });
    res.json({ username: res.locals.nameOfuser });
});
router.get("/crop/Community", (req, res) => {
    res.render('CropCommunity');
});

//Community Data Section

router.post("/upload-data/community", upload, async (req, res) => {
    try {
        const { location, crop, disease, isDiseased, person, category, suggestion } = req.body;
        const date= Date.now();
        // ✅ Validate Required Fields
        if (!location || !crop || !person || !category) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // ✅ Get Image URLs
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

        // ✅ Save Data to MongoDB
        const newCropData = new CropData({
            location,
            crop,
            disease,
            isDiseased,
            person,
            category,
            suggestion,
            images: imageUrls,
            date
        });

        await newCropData.save();

        res.json({ success: true, message: "Data uploaded successfully!", data: newCropData });

    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// // ✅ API to Get All Uploaded Data
router.get("/get-data/community", async (req, res) => {
    try {
        const data = await CropData.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// //Detailed Report Page
router.get('/Detailed/Report', (req, res) => {
    res.render('cropReport');
});



router.post("/api/report", async (req, res) => {
    try {
        const { crop, disease, confidence, imageUrl } = req.body;

        console.log("📩 Received Report:", { crop, disease, confidence, imageUrl });

        let isHealthy = disease.toLowerCase().includes("healthy");
        let prompt;

        if (isHealthy) {
            // ✅ Prompt for Healthy Crop
            prompt = `
            The crop "${crop}" is **healthy**.
            Each section should have at least **5-6 lines** of detailed explanation.
            Provide information in structured JSON format with these fields:
            {
                "ideal_conditions": "...",
                "preventive_measures": "...",
                "water_fertilization": "...",
                "common_threats": "...",
                "best_practices": [{ "practice": "...", "description": "..." }]
            }
            `;
        } else {
            // ✅ Prompt for Diseased Crop
            prompt = `
            Generate a detailed structured report on the crop disease **"${disease}"** in **"${crop}"**.
            Each section should have at least **5-6 lines** of detailed explanation.
            Provide information in structured JSON format with these fields:
            {
                "pathogen": "...",
                "pathogen_type": "...",
                "spread": "...",
                "favorable_conditions": "...",
                "best_practices": [{ "practice": "...", "description": "..." }],
                "natural_methods": [{ "name": "...", "description": "..." }],
                "chemical_pesticides": [{ "name": "...", "quantity": "...", "note": "..." }]
            }
            `;
        }

        // ✅ Generate Content using Gemini API
        const response = await model.generateContent(prompt);
        let generatedText = response.response.text();

        console.log("📜 Raw API Response:", generatedText);

        // ✅ Clean & Parse JSON Safely
        let parsedReport;
        try {
            generatedText = generatedText.replace(/```json|```/g, "").trim();
            generatedText = generatedText.replace(/,\s*([\]}])/g, '$1');
            parsedReport = JSON.parse(generatedText);
        } catch (error) {
            console.error("❌ JSON Parsing Error:", error);
            parsedReport = { error: "Invalid JSON response from Gemini API." };
        }

        // ✅ Construct Response Object
        let finalResponse = isHealthy
            ? {
                message: "Healthy Crop Report Generated",
                crop,
                disease,
                confidence: `${confidence}%`,
                imageUrl,
                ideal_conditions: parsedReport.ideal_conditions || "N/A",
                preventive_measures: parsedReport.preventive_measures || "N/A",
                water_fertilization: parsedReport.water_fertilization || "N/A",
                common_threats: parsedReport.common_threats || "N/A",
                best_practices: parsedReport.best_practices || []
            }
            : {
                message: "Diseased Crop Report Generated",
                crop,
                disease,
                confidence: `${confidence}%`,
                imageUrl,
                pathogen: parsedReport.pathogen || "N/A",
                pathogen_type: parsedReport.pathogen_type || "N/A",
                spread: parsedReport.spread || "N/A",
                favorable_conditions: parsedReport.favorable_conditions || "N/A",
                best_practices: parsedReport.best_practices || [],
                natural_methods: parsedReport.natural_methods || [],
                chemical_pesticides: parsedReport.chemical_pesticides || []
            };

        console.log("✅ Sending Final Report:", finalResponse);
        res.json(finalResponse);

        console.log("Correctly referred at the location ==> Set Time Out Success");

    } catch (error) {
        console.error("❌ Error generating report:", error);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

router.get("/cropYield", (req, res) => {
    res.render("yield");
})

// router.get("/cropRecommendation", (req, res) => {
//     res.render("cropR");
// })

async function scrapeImages(crop, disease) {
    const browser = await puppeteer.launch({
        headless: true, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set a user-agent to avoid being blocked by Google
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36');

    // Construct Google Image Search URL
    const searchQuery = `Original Leaf images of ${disease} disease`;
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(searchQuery)}`;

    console.log("Navigating to:", searchUrl);

    // Navigate to the Google Image search page
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Scroll down to load more images
    await page.evaluate(async () => {
        for (let i = 0; i < 3; i++) { // Scroll multiple times
            window.scrollBy(0, window.innerHeight);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    });

    // Extract first 15 image URLs
    const imageUrls = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('img[src^="http"]'))
            .map(img => img.src)
            .slice(0, 15);
    });

    console.log("Scraped Images:", imageUrls);

    await browser.close();
    return imageUrls;
}

let crop = "";
let disease = "";
let imageURLS = [];

// API Endpoint to fetch images
router.post('/webScrap/upload', async (req, res) => {
    const { crop: reqCrop, disease: reqDisease } = req.body;

    if (!reqCrop || !reqDisease) {
        return res.status(400).json({ error: 'Crop and disease are required' });
    }

    try {
        const images = await scrapeImages(reqCrop, reqDisease);

        // Store values in global variables
        crop = reqCrop;
        disease = reqDisease;
        imageURLS = images;

        res.json({ images });
    } catch (error) {
        console.error('Scraping Error:', error);
        res.status(500).json({ error: 'Failed to scrape images' });
    }
});

// Route to render crop images using EJS
router.get('/cropimages', (req, res) => {
    res.render('crop_images', { crop, disease, imageURLS });
});



module.exports = router;
