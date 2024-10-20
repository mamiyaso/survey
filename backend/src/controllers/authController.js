// src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Tüm alanları doldurun' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Create new user
    user = new User({ username, email, password });
    await user.save();

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in the environment variables');
      return res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Tüm alanları doldurun' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kimlik bilgileri' });
    }

    // Check if JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in the environment variables');
      return res.status(500).json({ message: 'Sunucu yapılandırma hatası' });
    }

    // Create and send token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.username = username || user.username;
    user.email = email || user.email;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};