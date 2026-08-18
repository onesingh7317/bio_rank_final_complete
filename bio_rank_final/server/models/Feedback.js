const mongoose = require('mongoose');
const feedbackSchema = new mongoose.Schema({
  level: { type: String, enum: ['question', 'test', 'product'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: ['new', 'reviewed', 'actioned'], default: 'new' },
}, { timestamps: true });
feedbackSchema.index({ level: 1, createdAt: -1 });
module.exports = mongoose.model('Feedback', feedbackSchema);
