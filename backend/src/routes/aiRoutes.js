const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getAICodeReview } = require('../services/aiService');
const EvaluationResult = require('../models/EvaluationResult');
const Submission = require('../models/Submission');

// @route POST /api/ai/review
// @desc  Get AI review for a submission
router.post('/review', protect, async (req, res) => {
  try {
    const { submissionId } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const evaluation = await EvaluationResult.findOne({ submissionId });
    if (!evaluation) return res.status(404).json({ success: false, message: 'Evaluation not found' });

    const result = await getAICodeReview(
      submission.code,
      submission.language,
      evaluation.qualityMetrics,
      evaluation.violations,
      evaluation.status
    );

    if (!result.success) {
      return res.status(500).json({ success: false, message: 'AI review failed: ' + result.error });
    }

    res.json({ success: true, review: result.review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;