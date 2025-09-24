// backend/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role });

    const token = generateToken(user);
    res.status(201).json({ user: { id: user.id, name, email, role }, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email}, token });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
