require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require('cookie-parser');
const { checkAuthStatus } = require('./middlewares/authMiddleware'); 
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const app = express();
const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cookieParser()); // For parsing cookies
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to make user object available in all EJS templates
app.use(checkAuthStatus);

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});
app.get('/premium', (req, res) => {
    res.render('premium', { title: 'Premium Features' });
});

app.use('/', authRoutes); // Mount auth routes at root level for /login, /register
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);


// Basic Error Handling
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    // For API requests, send JSON error
    if (req.originalUrl.startsWith('/api/')) {
        return res.json({
            error: {
                message: error.message
            }
        });
    }
    // For web pages, render an error page or simple message
    res.render('error', { // You'll need to create an error.ejs template
        title: 'Error',
        message: error.message,
        status: error.status || 500
    });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});