const express = require('express');
const cors = require('cors');
const { configDotenv } = require('dotenv');
configDotenv();

const connectDB = require('./src/config/database');
connectDB();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://smart-code-evaluator-six.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/assignments', require('./src/routes/assignmentRoutes'));
app.use('/api/submissions', require('./src/routes/submissionRoutes'));
app.use('/api/peer-reviews', require('./src/routes/peerReviewRoutes'));
app.use('/api/ai', require('./src/routes/aiRoutes'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));