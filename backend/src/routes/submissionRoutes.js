const express = require('express');
const router = express.Router();
const {
  submitCode,
  getMySubmissions,
  getSubmissionsByAssignment,
  getSubmission,
  getLeaderboard,
  getIndustryReadiness
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.post('/', authorize('student'), submitCode);
router.get('/my', authorize('student'), getMySubmissions);
router.get('/industry-readiness', authorize('student'), getIndustryReadiness);
router.get('/assignment/:assignmentId', getSubmissionsByAssignment);
router.get('/leaderboard/:assignmentId', getLeaderboard);
router.get('/:id', getSubmission);

module.exports = router;