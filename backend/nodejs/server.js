require("dotenv").config();

const express = require("express");
const cors = require("cors");

const searchRoutes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", searchRoutes);

// Home API
app.get("/", (req, res) => {
    res.json({
        message: "Node.js Search Gateway Running Successfully"
    });
});
console.log("Academia Search Gateway Started");
// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});