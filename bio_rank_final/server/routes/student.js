const express = require('express');
const { updateProfile, changePassword } = require('../controllers/studentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.put('/profile', requireAuth, updateProfile);
router.post('/change-password', requireAuth, changePassword);

module.exports = router;
