const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
  batch: { type: String, default: '' },
  totalScore: { type: Number, default: 0 },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);