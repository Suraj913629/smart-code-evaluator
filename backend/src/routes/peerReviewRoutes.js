const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  assignPeerReview,
  getMyReviews,
  submitReview,
  getReviewsForSubmission
} = require('../controllers/peerReviewController');

router.use(protect);
router.post('/assign', authorize('faculty', 'admin'), assignPeerReview);
router.get('/my', authorize('student'), getMyReviews);
router.put('/:id/submit', authorize('student'), submitReview);
router.get('/submission/:submissionId', getReviewsForSubmission);

module.exports = router;