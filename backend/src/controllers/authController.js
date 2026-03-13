const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const register = async (req, res) => {
  try {
    const { name, email, password, role, batch } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });
    
    // Hash password here in controller
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      role: role || 'student', 
      batch: batch || '' 
    });
    
    const token = generateToken(user._id);
    res.status(201).json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, batch: user.batch } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    
    const token = generateToken(user._id);
    res.json({ 
      success: true, 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, batch: user.batch, badges: user.badges, totalScore: user.totalScore } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ 
      success: true, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role, batch: user.batch, badges: user.badges, totalScore: user.totalScore } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };