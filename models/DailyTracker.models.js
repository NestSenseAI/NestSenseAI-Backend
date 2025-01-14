const mongoose = require("mongoose");

const dailyEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to user
  date: { type: String, unique: true, required: true }, // Date in YYYY-MM-DD format
  mood: { type: Number, required: true }, // Mood on a scale (e.g., 1-10)
  energy: { type: Number, required: true }, // Energy level on a scale
  symptoms: { type: [String], default: [] }, // Array of symptoms
});

module.exports = mongoose.model("DailyEntry", dailyEntrySchema);
