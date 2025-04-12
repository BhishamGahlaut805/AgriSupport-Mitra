const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const cors = require('cors');
const router = express.Router();
const { WebhookClient } = require('dialogflow-fulfillment');
router.use(cors());
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/chat",(req,res)=>{
    res.render("chatbot");
});

module.exports = router;
