const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const EvaluationResult = require('../models/EvaluationResult');
const User = require('../models/User');
const { runTestCases } = require('../services/testRunnerService');
const { analyzeCode } = require('../services/codeAnalysisService');
const { calculateScore } = require('../services/scoringService');

const submitCode = async (req, res) => {
  try {
    const { assignmentId, code, language } = req.body;
    if (!assignmentId || !code) return res.status(400).json({ success: false, message: 'Assignment ID and code are required' });
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });
    const isLate = new Date() > new Date(assignment.deadline);
    const lastSub = await Submission.findOne({ assignmentId, studentId: req.user._id }).sort({ version: -1 });
    const version = lastSub ? lastSub.version + 1 : 1;
    const submission = await Submission.create({ assignmentId, studentId: req.user._id, code, language: language || assignment.language, version, isLate });
    const testResults = await runTestCases(code, assignment.testCases, language || assignment.language);
    const status = testResults.passed === testResults.total ? 'CORRECT' : 'INCORRECT';
    const { metrics } = analyzeCode(code, language || assignment.language);
    const { score, grade, violations, suggestions } = calculateScore(metrics, assignment.parameters, assignment.weightage);
    const evaluation = await EvaluationResult.create({ submissionId: submission._id, status, testResults, qualityMetrics: metrics, score, grade, violations, suggestions });
    await User.findByIdAndUpdate(req.user._id, { $max: { totalScore: score } });
    const badges = await checkBadges(req.user._id, score, status, version);
    res.status(201).json({
      success: true, message: 'Submitted successfully',
      submission: { id: submission._id, version, isLate, submittedAt: submission.submittedAt },
      evaluation: { status, testResults: { passed: testResults.passed, total: testResults.total,
        details: testResults.details.map(d => ({ testCaseIndex: d.testCaseIndex, passed: d.passed, error: d.error,
          input: d.visible ? d.input : 'Hidden', expectedOutput: d.visible ? d.expectedOutput : 'Hidden', actualOutput: d.visible ? d.actualOutput : 'Hidden' }))
      }, qualityMetrics: metrics, score, grade, violations, suggestions },
      newBadges: badges
    });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id }).populate('assignmentId', 'title language deadline').sort({ submittedAt: -1 });
    const result = await Promise.all(submissions.map(async s => ({ ...s.toObject(), evaluation: await EvaluationResult.findOne({ submissionId: s._id }) })));
    res.json({ success: true, submissions: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubmissionsByAssignment = async (req, res) => {
  try {
    const query = { assignmentId: req.params.assignmentId };
    if (req.user.role === 'student') query.studentId = req.user._id;
    const submissions = await Submission.find(query).populate('studentId', 'name email batch').sort({ submittedAt: -1 });
    const result = await Promise.all(submissions.map(async s => ({ ...s.toObject(), evaluation: await EvaluationResult.findOne({ submissionId: s._id }) })));
    res.json({ success: true, submissions: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('studentId', 'name email').populate('assignmentId', 'title language parameters weightage');
    if (!submission) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'student' && submission.studentId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });
    const evaluation = await EvaluationResult.findOne({ submissionId: submission._id });
    res.json({ success: true, submission: { ...submission.toObject(), evaluation } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignmentId: req.params.assignmentId }).populate('studentId', 'name batch');
    const leaderboard = []; const seen = new Set();
    for (const sub of submissions) {
      const sid = sub.studentId?._id?.toString();
      if (!sid || seen.has(sid)) continue;
      seen.add(sid);
      const ev = await EvaluationResult.findOne({ submissionId: sub._id });
      if (ev) leaderboard.push({ student: { name: sub.studentId.name, batch: sub.studentId.batch }, score: ev.score, grade: ev.grade, status: ev.status });
    }
    leaderboard.sort((a, b) => b.score - a.score);
    res.json({ success: true, leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkBadges = async (userId, score, status, version) => {
  const newBadges = [];
  const user = await User.findById(userId);
  const existing = user.badges.map(b => b.name);
  const toAdd = [];
  if (version === 1 && !existing.includes('First Submission')) toAdd.push({ name: 'First Submission', description: 'Made your first submission!', icon: '🎯' });
  if (score === 100 && !existing.includes('Perfect Score')) toAdd.push({ name: 'Perfect Score', description: 'Achieved a perfect score!', icon: '⭐' });
  if (score >= 90 && !existing.includes('Code Quality Master')) toAdd.push({ name: 'Code Quality Master', description: 'Scored 90+ quality score', icon: '🏆' });
  if (status === 'CORRECT' && !existing.includes('Bug Free')) toAdd.push({ name: 'Bug Free', description: 'Passed all test cases!', icon: '✅' });
  if (toAdd.length > 0) { await User.findByIdAndUpdate(userId, { $push: { badges: { $each: toAdd } } }); newBadges.push(...toAdd); }
  return newBadges;
};

const getIndustryReadiness = async (req, res) => {
  try {
    const submissions = await Submission.find({ studentId: req.user._id })
      .populate('assignmentId', 'title language')
      .sort({ submittedAt: 1 });

    const results = await Promise.all(
      submissions.map(async (sub) => {
        const ev = await EvaluationResult.findOne({ submissionId: sub._id });
        return ev ? { score: ev.score, status: ev.status, submittedAt: sub.submittedAt, title: sub.assignmentId?.title } : null;
      })
    );

    const validResults = results.filter(Boolean);
    const totalSubmissions = validResults.length;

    if (totalSubmissions === 0) {
      return res.json({
        success: true,
        industryReadiness: {
          score: 0,
          level: 'Beginner',
          totalSubmissions: 0,
          avgScore: 0,
          correctCount: 0,
          trend: 'neutral',
          breakdown: { codeQuality: 0, problemSolving: 0, consistency: 0 }
        }
      });
    }

    const avgScore = Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / totalSubmissions);
    const correctCount = validResults.filter(r => r.status === 'CORRECT').length;
    const problemSolving = Math.round((correctCount / totalSubmissions) * 100);

    // Consistency score - how many submissions scored above 60
    const consistentCount = validResults.filter(r => r.score >= 60).length;
    const consistency = Math.round((consistentCount / totalSubmissions) * 100);

    // Trend - is score improving?
    let trend = 'neutral';
    if (validResults.length >= 3) {
      const recent = validResults.slice(-3).map(r => r.score);
      if (recent[2] > recent[0]) trend = 'improving';
      else if (recent[2] < recent[0]) trend = 'declining';
    }

    // Overall industry readiness score
    const industryScore = Math.round((avgScore * 0.4) + (problemSolving * 0.4) + (consistency * 0.2));

    // Level based on score
    let level = 'Beginner';
    if (industryScore >= 85) level = 'Industry Ready';
    else if (industryScore >= 70) level = 'Advanced';
    else if (industryScore >= 50) level = 'Intermediate';
    else if (industryScore >= 30) level = 'Developing';

    res.json({
      success: true,
      industryReadiness: {
        score: industryScore,
        level,
        totalSubmissions,
        avgScore,
        correctCount,
        trend,
        breakdown: {
          codeQuality: avgScore,
          problemSolving,
          consistency
        },
        recentSubmissions: validResults.slice(-5).map(r => ({
          title: r.title,
          score: r.score,
          status: r.status,
          submittedAt: r.submittedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { submitCode, getMySubmissions, getSubmissionsByAssignment, getSubmission, getLeaderboard, getIndustryReadiness };