const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const pythonResponse = await axios.post("https://nestsenseai-solace.onrender.com/chat", {
      message: userMessage,
    });

    res.status(200).json(pythonResponse.data);
  } catch (error) {
    console.error("Error communicating with Python backend:", error.message);
    res.status(500).json({ error: "Failed to process the request. Please try again later." });
  }
});

module.exports = router;
