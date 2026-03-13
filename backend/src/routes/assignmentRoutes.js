const express = require('express');
const router = express.Router();
const { createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment, getAssignmentAnalytics } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.get('/:id/analytics', authorize('faculty', 'admin'), getAssignmentAnalytics);
router.post('/', authorize('faculty', 'admin'), createAssignment);
router.put('/:id', authorize('faculty', 'admin'), updateAssignment);
router.delete('/:id', authorize('faculty', 'admin'), deleteAssignment);

module.exports = router;