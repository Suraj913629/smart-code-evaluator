const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  deadline: { type: Date, required: true },
  language: { type: String, enum: ['javascript', 'python', 'java', 'cpp'], default: 'javascript' },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  batch: { type: String, required: true },
  testCases: [{
    input: { type: mongoose.Schema.Types.Mixed, required: true },
    expectedOutput: { type: mongoose.Schema.Types.Mixed, required: true },
    visible: { type: Boolean, default: true },
    description: { type: String, default: '' }
  }],
  parameters: {
    maxLOC: { type: Number, default: 100 },
    maxComplexity: { type: Number, default: 10 },
    maxFunctionLength: { type: Number, default: 50 },
    maxIfElseDepth: { type: Number, default: 3 },
    maxLoops: { type: Number, default: 5 },
    minCommentDensity: { type: Number, default: 10 },
    maxDuplication: { type: Number, default: 15 }
  },
  weightage: {
    complexity: { type: Number, default: 40 },
    codeLength: { type: Number, default: 20 },
    comments: { type: Number, default: 15 },
    duplication: { type: Number, default: 25 }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', AssignmentSchema);