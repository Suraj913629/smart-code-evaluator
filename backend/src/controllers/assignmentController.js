const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const EvaluationResult = require('../models/EvaluationResult');

const createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, facultyId: req.user._id });
    res.status(201).json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    let query = { isActive: true };
    if (req.user.role === 'faculty') query.facultyId = req.user._id;
    else if (req.user.role === 'student') query.batch = req.user.batch;
    const assignments = await Assignment.find(query).populate('facultyId', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('facultyId', 'name email');
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    let data = assignment.toObject();
    if (req.user.role === 'student') {
      data.testCases = data.testCases.map(tc => tc.visible ? tc : { ...tc, input: 'Hidden', expectedOutput: 'Hidden' });
    }
    res.json({ success: true, assignment: data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'faculty' && assignment.facultyId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const updated = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, assignment: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'faculty' && assignment.facultyId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await Assignment.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAssignmentAnalytics = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.id }).populate('studentId', 'name email batch');
    const results = [];
    for (const sub of submissions) {
      const evalResult = await EvaluationResult.findOne({ submissionId: sub._id });
      if (evalResult) results.push({ student: sub.studentId, submission: sub, evaluation: evalResult });
    }
    const totalSubmissions = results.length;
    const avgScore = totalSubmissions > 0 ? Math.round(results.reduce((s, r) => s + r.evaluation.score, 0) / totalSubmissions) : 0;
    const gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const correctCount = results.filter(r => r.evaluation.status === 'CORRECT').length;
    results.forEach(r => gradeDistribution[r.evaluation.grade]++);
    const topPerformers = results.sort((a, b) => b.evaluation.score - a.evaluation.score).slice(0, 5)
      .map(r => ({ name: r.student?.name, email: r.student?.email, score: r.evaluation.score, grade: r.evaluation.grade, status: r.evaluation.status }));
    res.json({ success: true, analytics: { totalSubmissions, avgScore, correctCount, incorrectCount: totalSubmissions - correctCount, gradeDistribution, topPerformers,
      submissions: results.map(r => ({ studentName: r.student?.name, studentEmail: r.student?.email, score: r.evaluation.score, grade: r.evaluation.grade, status: r.evaluation.status, submittedAt: r.submission.submittedAt, version: r.submission.version }))
    }});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createAssignment, getAssignments, getAssignment, updateAssignment, deleteAssignment, getAssignmentAnalytics };