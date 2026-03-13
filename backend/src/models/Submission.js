const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  language: { type: String, default: 'javascript' },
  version: { type: Number, default: 1 },
  submittedAt: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false }
});

module.exports = mongoose.model('Submission', SubmissionSchema);