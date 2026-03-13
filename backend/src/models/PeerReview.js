const mongoose = require('mongoose');

const PeerReviewSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String, maxlength: 1000 },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PeerReview', PeerReviewSchema);