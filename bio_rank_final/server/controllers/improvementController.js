const mongoose = require('mongoose');
const ImprovementEntry = require('../models/ImprovementEntry');

exports.syncImprovementBook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { entries } = req.body;

    if (!Array.isArray(entries)) {
      return res.status(400).json({ error: 'Entries must be an array.' });
    }

    let syncedCount = 0;
    
    // Use bulkWrite for efficient upserts
    const bulkOps = entries.map(entry => ({
      updateOne: {
        filter: { userId, questionId: entry.questionId },
        update: { $set: { ...entry, userId } },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      const result = await ImprovementEntry.bulkWrite(bulkOps);
      syncedCount = result.upsertedCount + result.modifiedCount;
    }

    return res.status(200).json({ ok: true, synced: syncedCount });
  } catch (error) {
    console.error('Error syncing improvement book:', error);
    return res.status(500).json({ error: 'Server error while syncing improvement book.' });
  }
};

exports.getImprovementBook = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const entries = await ImprovementEntry.find(query).sort({ wrongDate: -1 }).lean();

    // Get stats
    const statsResult = await ImprovementEntry.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const stats = { active: 0, reviewing: 0, mastered: 0 };
    statsResult.forEach(item => {
      if (item._id in stats) {
        stats[item._id] = item.count;
      }
    });

    return res.status(200).json({ entries, stats });
  } catch (error) {
    console.error('Error fetching improvement book:', error);
    return res.status(500).json({ error: 'Server error while fetching improvement book.' });
  }
};

exports.updateEntry = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { status, reviewCount, nextReviewDate, mistakeReason } = req.body;

    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (reviewCount !== undefined) updateData.reviewCount = reviewCount;
    if (nextReviewDate !== undefined) updateData.nextReviewDate = nextReviewDate;
    if (mistakeReason !== undefined) updateData.mistakeReason = mistakeReason;

    const entry = await ImprovementEntry.findOneAndUpdate(
      { _id: id, userId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found.' });
    }

    return res.status(200).json({ ok: true, entry });
  } catch (error) {
    console.error('Error updating entry:', error);
    return res.status(500).json({ error: 'Server error while updating entry.' });
  }
};
