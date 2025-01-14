const mongoose = require("mongoose");

const weeklySummarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  weekStart: { type: String, required: true }, // Start date of the week (e.g., "2025-01-01")
  moodAverage: { type: Number, required: true },
  energyAverage: { type: Number, required: true },
  commonSymptoms: { type: [String], default: [] },
});

module.exports = mongoose.model("WeeklySummary", weeklySummarySchema);
