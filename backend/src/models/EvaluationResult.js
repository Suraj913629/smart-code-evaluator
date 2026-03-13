const mongoose = require('mongoose');

const EvaluationResultSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
  status: { type: String, enum: ['CORRECT', 'INCORRECT'], required: true },
  testResults: {
    passed: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    details: [{ 
      testCaseIndex: Number,
      input: mongoose.Schema.Types.Mixed,
      expectedOutput: mongoose.Schema.Types.Mixed,
      actualOutput: mongoose.Schema.Types.Mixed,
      passed: Boolean,
      visible: Boolean,
      error: String
    }]
  },
  qualityMetrics: {
    loc: { type: Number, default: 0 },
    complexity: { type: Number, default: 0 },
    commentDensity: { type: Number, default: 0 },
    duplication: { type: Number, default: 0 },
    functionLength: { type: Number, default: 0 },
    ifElseDepth: { type: Number, default: 0 },
    loops: { type: Number, default: 0 }
  },
  score: { type: Number, default: 0, min: 0, max: 100 },
  grade: { type: String, enum: ['A', 'B', 'C', 'D', 'F'], default: 'F' },
  violations: [{
    metric: String,
    severity: { type: String, enum: ['Critical', 'Major', 'Minor'] },
    message: String,
    actual: Number,
    limit: Number
  }],
  suggestions: [String],
  evaluatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EvaluationResult', EvaluationResultSchema);