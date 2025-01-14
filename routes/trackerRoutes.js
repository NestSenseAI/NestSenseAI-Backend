const express = require("express");
const DailyEntry = require("../models/dailyEntry"); // Import the daily entry model
const router = express.Router();

// POST route to save a daily entry
router.post("/daily-entry", async (req, res) => {
  const { userId, date, mood, energy, symptoms } = req.body;

  try {
    // Check if an entry for the same date already exists
    const existingEntry = await DailyEntry.findOne({ userId, date });
    if (existingEntry) {
      return res.status(400).json({ message: "Entry for this date already exists." });
    }

    // Save the new entry
    const newEntry = new DailyEntry({ userId, date, mood, energy, symptoms });
    await newEntry.save();

    res.status(201).json({ message: "Daily entry saved successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error saving daily entry", error });
  }
});

module.exports = router;
