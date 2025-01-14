const express = require('express');
const router = express.Router();
const {
  getAllEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry
} = require('../controllers/wellnessController');

// Get all wellness entries (with optional user_id filter)
router.get('/', getAllEntries);

// Get a specific wellness entry
router.get('/:id', getEntryById);

// Create a new wellness entry
router.post('/', createEntry);

// Update an existing wellness entry
router.put('/:id', updateEntry);

// Delete a wellness entry
router.delete('/:id', deleteEntry);

module.exports = router;