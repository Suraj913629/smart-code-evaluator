const PeerReview = require('../models/PeerReview');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Faculty assigns peer reviews
// @route   POST /api/peer-reviews/assign
const assignPeerReview = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    // Get all submissions for this assignment
    const submissions = await Submission.find({ assignmentId })
      .populate('studentId', 'name email');

    if (submissions.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 2 submissions to assign peer reviews'
      });
    }

    // Delete existing peer reviews for this assignment
    await PeerReview.deleteMany({ assignmentId });

    const reviews = [];

    // Each student reviews the next student's submission (circular)
    for (let i = 0; i < submissions.length; i++) {
      const reviewer = submissions[i].studentId;
      const reviewee = submissions[(i + 1) % submissions.length].studentId;
      const submissionToReview = submissions[(i + 1) % submissions.length];

      reviews.push({
        assignmentId,
        reviewerId: reviewer._id,
        revieweeId: reviewee._id,
        submissionId: submissionToReview._id
      });
    }

    await PeerReview.insertMany(reviews);

    res.json({
      success: true,
      message: `${reviews.length} peer reviews assigned successfully`,
      count: reviews.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get peer reviews assigned to me
// @route   GET /api/peer-reviews/my
const getMyReviews = async (req, res) => {
  try {
    const reviews = await PeerReview.find({ reviewerId: req.user._id })
      .populate('submissionId')
      .populate('revieweeId', 'name batch')
      .populate('assignmentId', 'title language')
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Student submits a peer review
// @route   PUT /api/peer-reviews/:id/submit
const submitReview = async (req, res) => {
  try {
    const { rating, feedback, codeReadability, logicClarity, bestPractices } = req.body;

    const review = await PeerReview.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    if (review.reviewerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (review.completed) {
      return res.status(400).json({ success: false, message: 'Review already submitted' });
    }

    review.rating = rating;
    review.feedback = feedback;
    review.codeReadability = codeReadability;
    review.logicClarity = logicClarity;
    review.bestPractices = bestPractices;
    review.completed = true;
    review.completedAt = new Date();

    await review.save();

    res.json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a submission
// @route   GET /api/peer-reviews/submission/:submissionId
const getReviewsForSubmission = async (req, res) => {
  try {
    const reviews = await PeerReview.find({
      submissionId: req.params.submissionId,
      completed: true
    }).populate('reviewerId', 'name');

    res.json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { assignPeerReview, getMyReviews, submitReview, getReviewsForSubmission };