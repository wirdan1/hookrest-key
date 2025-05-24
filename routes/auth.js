const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { protect } = require('../middlewares/authMiddleware');

router.get('/register', (req, res) => res.render('register', { title: 'Register' }));

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).render('register', { title: 'Register', error: 'User already exists' });
    }
    const user = await User.create({ username, email, password }); // role defaults to 'user'
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).render('register', { title: 'Register', error: 'Server error' });
  }
});

router.get('/login', (req, res) => res.render('login', { title: 'Login' }));

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });
      res.redirect(user.role === 'admin' ? '/admin/dashboard' : '/');
    } else {
      res.status(401).render('login', { title: 'Login', error: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).render('login', { title: 'Login', error: 'Server error' });
  }
});

router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});
router.get('/profile', protect, (req, res) => {
    res.render('profile', { title: 'My Profile', user: req.user }); 
});


module.exports = router;
