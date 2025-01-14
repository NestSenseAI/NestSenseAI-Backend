const express = require('express')
const { authenticateToken } = require('../middlewares/authMiddleware')
const User = require('../models/User')

const router = express.Router()

router.get('/user-profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password') // Exclude password
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
