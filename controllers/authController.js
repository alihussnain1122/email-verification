const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utility/sendEmails');

// 🔐 Register Controller
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const existing = await User.findOne({ email });

    // ✅ Check for already registered users
    if (existing) {
      if (existing.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        await User.deleteOne({ email }); // Optional: clean unverified users
      }
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debug log

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Create user first
    const user = await User.create({ name, email, password: hashedPassword });

    // ✅ Create token after user is created
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const url = `http://localhost:5173/verify/${token}`;

    // ✅ Send verification email
    await sendEmail(user.email, 'Verify Your Email', `Click to verify: ${url}`);

    res.status(201).json({ message: 'Registered successfully, verify your email to login' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// 🔐 Verify Email Controller
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    if (user.isVerified) return res.send('Email already verified');

    user.isVerified = true;
    await user.save();

    res.send('Email verified successfully!');
  } catch (error) {
    res.status(400).send('Invalid or expired token');
  }
};

// 🔐 Login Controller
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User does not exist' });

    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email to login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
