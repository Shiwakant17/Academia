const express = require("express");
const axios = require("axios");

require("dotenv").config();

const router = express.Router();

const PYTHON_API_URL = process.env.PYTHON_API_URL;


// Forward search request to Python FastAPI
router.post("/search", async (req, res) => {

    try {

        const response = await axios.post(
            `${PYTHON_API_URL}/search`,
            {
                query: req.body.query
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            message: "Semantic search failed"
        });
    }

});


// Forward course insertion to Python
router.post("/add-course", async (req, res) => {

    try {

        const response = await axios.post(
            `${PYTHON_API_URL}/add-course`,
            req.body
        );

        res.json(response.data);

    } catch (error) {

        console.error(error.message);

        res.status(500).json({
            message: "Adding course failed"
        });
    }

});


module.exports = router;