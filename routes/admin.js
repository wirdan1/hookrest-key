const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const User = require('../models/user');
const Promo = require('../models/promo');
const { v4: uuidv4 } = require('uuid');
router.use(protect, isAdmin); 
router.get('/dashboard', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(5);
    const promos = await Promo.find().sort({ createdAt: -1 }).limit(5);
    res.render('admin/dashboard', { title: 'Admin Dashboard', users, promos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.post('/users/:id/toggle-admin', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send('User not found');
    if (user._id.equals(req.user._id)) { 
        return res.status(400).send('Admin tidak bisa mengubah role diri sendiri.');
    }
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.redirect('/admin/users');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

router.get('/promos/add', (req, res) => {
  res.render('admin/add-promo', { title: 'Add Promo' });
});

router.post('/promos/add', async (req, res) => {
  const { title, description, code, discountPercentage, endDate } = req.body;
  try {
    await Promo.create({
      title,
      description,
      code: code || null,
      discountPercentage: discountPercentage || null,
      endDate: endDate || null,
      createdBy: req.user._id
    });
    res.redirect('/admin/dashboard'); 
  } catch (error) {
    console.error(error);
    res.status(500).render('admin/add-promo', { title: 'Add Promo', error: error.message, formData: req.body });
  }
});
router.get('/users/:id/set-apikey', async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            return res.status(404).send('User not found');
        }
        res.render('admin/set-apikey', { title: 'Set API Key', userToUpdate });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});
router.post('/users/:id/set-apikey', async (req, res) => {
    try {
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            return res.status(404).send('User not found');
        }
        const newApiKey = req.body.apiKey || uuidv4();
        userToUpdate.apiKey = newApiKey;
        await userToUpdate.save();
        res.redirect('/admin/users');
    } catch (error) {
        console.error(error);
        if (error.code === 11000) { 
             const userToUpdate = await User.findById(req.params.id); 
             return res.status(400).render('admin/set-apikey', {
                title: 'Set API Key',
                userToUpdate,
                error: 'API Key sudah digunakan. Coba yang lain atau biarkan kosong untuk generate otomatis.'
            });
        }
        res.status(500).send('Server Error');
    }
});
router.post('/promos/:id/notify', async (req, res) => {
    try {
        const promo = await Promo.findById(req.params.id);
        if (!promo) {
            return res.status(404).send('Promo not found');
        }
        console.log(`ADMIN ACTION: "Sending" notification for promo: ${promo.title}`);
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


module.exports = router;
