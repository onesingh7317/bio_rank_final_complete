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
    weakAreas: user.weakAreas
  };
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      name, classLevel, targetYear, board, studyHoursPerDay,
      strongAreas, weakAreas, configured, foundationDone
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

    const user = await User.findByIdAndUpdate(userId, { $set: updateFields }, { new: true });
    
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    res.json({ ok: true, user: getPublicUser(user) });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ ok: false, error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ ok: false, error: 'New password must be at least 6 characters long' });
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

    res.json({ ok: true, message: 'Password updated.' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};
