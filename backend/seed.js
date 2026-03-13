const { configDotenv } = require('dotenv');
configDotenv();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');
const Assignment = require('./src/models/Assignment');

const seed = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Assignment.deleteMany({});
    console.log('Cleared existing data');

    // Hash password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const faculty = await User.create({
      name: 'Dr. Smith',
      email: 'faculty@test.com',
      password: hashedPassword,
      role: 'faculty',
      batch: ''
    });

    await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      batch: ''
    });

    await User.create({
      name: 'Alice Johnson',
      email: 'student@test.com',
      password: hashedPassword,
      role: 'student',
      batch: 'CSE-A'
    });

    await User.create({
      name: 'Bob Smith',
      email: 'bob@test.com',
      password: hashedPassword,
      role: 'student',
      batch: 'CSE-A'
    });

    console.log('Users created');

    await Assignment.create({
      title: 'Two Sum Problem',
      description: `Write a JavaScript function called 'solution' that takes an array of numbers and a target number, and returns the indices of the two numbers that add up to the target.

Example:
- Input: ([2, 7, 11, 15], 9)
- Output: [0, 1]

Requirements:
- Function must be named 'solution'
- Return an array of two indices`,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      language: 'javascript',
      facultyId: faculty._id,
      batch: 'CSE-A',
      testCases: [
        { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1], visible: true },
        { input: [[3, 2, 4], 6], expectedOutput: [1, 2], visible: true },
        { input: [[3, 3], 6], expectedOutput: [0, 1], visible: false }
      ],
      parameters: {
        maxLOC: 30,
        maxComplexity: 5,
        maxFunctionLength: 20,
        maxIfElseDepth: 3,
        maxLoops: 3,
        minCommentDensity: 10,
        maxDuplication: 10
      },
      weightage: { complexity: 40, codeLength: 20, comments: 15, duplication: 25 }
    });

    console.log('Sample assignment created');
    console.log('\n✅ Seed completed!');
    console.log('Admin:   admin@test.com / password123');
    console.log('Faculty: faculty@test.com / password123');
    console.log('Student: student@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();