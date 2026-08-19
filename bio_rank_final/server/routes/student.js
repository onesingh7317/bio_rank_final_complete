const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  updateProfile,
  changePassword,
  uploadAvatar,
  syncNcertProgress,
  getNcertProgress,
} = require('../controllers/studentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer storage for avatars
const uploadDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const rawExt = (path.extname(file.originalname) || '').toLowerCase();
    const ext = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (ALLOWED_EXTENSIONS.includes(ext) && ALLOWED_MIMETYPES.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPG, PNG, and WEBP images are allowed.'));
    }
  },
});

// Student Profile Management
router.put('/profile', requireAuth, updateProfile);
router.post('/avatar', requireAuth, upload.single('avatar'), uploadAvatar);
router.post('/change-password', requireAuth, changePassword);

// NCERT Progress Tracking
router.post('/ncert-progress', requireAuth, syncNcertProgress);
router.get('/ncert-progress', requireAuth, getNcertProgress);

module.exports = router;
