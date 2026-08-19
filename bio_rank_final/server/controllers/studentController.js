const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const getPublicUser = (user) => {
  return {
    id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    targetYear: user.targetYear,
    board: user.board,
    studyHoursPerDay: user.studyHoursPerDay,
    configured: user.configured,
    foundationDone: user.foundationDone,
    classLevel: user.classLevel,
    strongAreas: user.strongAreas,
    weakAreas: user.weakAreas,
    avatarUrl: user.avatarUrl,
    ncertProgress: user.ncertProgress || {},
  };
};

/* ============================================================
   PUT /api/user/profile
   ============================================================ */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name,
      classLevel,
      targetYear,
      board,
      studyHoursPerDay,
      strongAreas,
      weakAreas,
      configured,
      foundationDone,
      avatarUrl,
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (classLevel !== undefined) updateFields.classLevel = classLevel;
    if (targetYear !== undefined) updateFields.targetYear = targetYear;
    if (board !== undefined) updateFields.board = board;
    if (studyHoursPerDay !== undefined) updateFields.studyHoursPerDay = studyHoursPerDay;
    if (strongAreas !== undefined) updateFields.strongAreas = strongAreas;
    if (weakAreas !== undefined) updateFields.weakAreas = weakAreas;
    if (configured !== undefined) updateFields.configured = configured;
    if (foundationDone !== undefined) updateFields.foundationDone = foundationDone;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    return res.json({ ok: true, user: getPublicUser(user) });
  } catch (error) {
    console.error('[student.updateProfile]', error);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/* ============================================================
   POST /api/user/avatar
   Uploads student avatar image file and saves URL in database.
   ============================================================ */
exports.uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.userId;

    let avatarUrl = '';

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body.avatarDataUrl || req.body.avatarUrl) {
      const candidate = (req.body.avatarDataUrl || req.body.avatarUrl || '').trim();
      const isValidDataUri = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(candidate);
      const isValidHttpUrl = /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(candidate);
      const isValidUploadPath = candidate.startsWith('/uploads/avatars/');

      if (isValidDataUri || isValidHttpUrl || isValidUploadPath) {
        avatarUrl = candidate;
      } else {
        return res.status(400).json({ ok: false, error: 'Invalid avatar image URL or format.' });
      }
    } else {
      return res.status(400).json({ ok: false, error: 'No image file or URL provided.' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatarUrl } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }

    return res.json({ ok: true, avatarUrl, user: getPublicUser(user) });
  } catch (error) {
    console.error('[student.uploadAvatar]', error);
    return res.status(500).json({ ok: false, error: 'Failed to upload avatar.' });
  }
};

/* ============================================================
   POST /api/user/change-password
   ============================================================ */
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, error: 'Current and new password are required' });
    }

    const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!PASSWORD_RE.test(newPassword)) {
      return res.status(400).json({ ok: false, error: 'New password must be at least 8 characters long and contain both letters and numbers.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ ok: false, error: 'Invalid current password' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ ok: true, message: 'Password updated.' });
  } catch (error) {
    console.error('[student.changePassword]', error);
    return res.status(500).json({ ok: false, error: 'Server error' });
  }
};

/* ============================================================
   POST /api/user/ncert-progress
   Syncs NCERT chapter practice attempts, best scores, and accuracy.
   ============================================================ */
exports.syncNcertProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chapterId, attempts, bestScore, totalQuestions, accuracy, ncertProgress } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const currentMap = user.ncertProgress || {};

    if (chapterId) {
      const prev = currentMap[chapterId] || { attempts: 0, bestScore: 0, totalQuestions: totalQuestions || 0 };
      currentMap[chapterId] = {
        attempts: attempts !== undefined ? Number(attempts) : (prev.attempts || 0) + 1,
        bestScore: Math.max(prev.bestScore || 0, Number(bestScore) || 0),
        totalQuestions: totalQuestions || prev.totalQuestions || 0,
        accuracy: accuracy !== undefined ? Number(accuracy) : prev.accuracy || 0,
        lastAttemptDate: new Date(),
      };
    } else if (ncertProgress && typeof ncertProgress === 'object') {
      Object.assign(currentMap, ncertProgress);
    }

    user.ncertProgress = currentMap;
    user.markModified('ncertProgress');
    await user.save();

    return res.json({ ok: true, ncertProgress: user.ncertProgress });
  } catch (error) {
    console.error('[student.syncNcertProgress]', error);
    return res.status(500).json({ ok: false, error: 'Failed to sync NCERT progress.' });
  }
};

/* ============================================================
   GET /api/user/ncert-progress
   ============================================================ */
exports.getNcertProgress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('ncertProgress').lean();

    return res.json({ ok: true, ncertProgress: (user && user.ncertProgress) || {} });
  } catch (error) {
    console.error('[student.getNcertProgress]', error);
    return res.status(500).json({ ok: false, error: 'Failed to fetch NCERT progress.' });
  }
};
