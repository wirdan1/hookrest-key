const jwt = require('jsonwebtoken');
const User = require('../models/user');
const protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.clearCookie('token');
        return res.status(401).redirect('/login');
      }
      next();
    } catch (error) {
      console.error(error);
      res.clearCookie('token');
      return res.status(401).redirect('/login');
    }
  } else {
    res.status(401).redirect('/login');
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Akses ditolak: Anda bukan admin.');
  }
};

const checkAuthStatus = async (req, res, next) => {
  let token;
  res.locals.user = null;
  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        res.locals.user = user;
      }
    } catch (error) {
      console.error("Token verification failed:", error.message);
      res.clearCookie('token');
    }
  }
  next();
};


module.exports = { protect, isAdmin, checkAuthStatus };
