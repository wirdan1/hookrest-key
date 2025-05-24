const express = require('express');
const router = express.Router();
const Promo = require('../models/promo');
const User = require('../models/user'); 
const checkApiKey = async (req, res, next) => {
    const apiKey = req.query.apikey || req.headers['x-api-key'];
    if (!apiKey) {
        return res.status(401).json({ message: 'API Key required' });
    }
    try {
        const user = await User.findOne({ apiKey: apiKey });
        if (!user) {
            return res.status(403).json({ message: 'Invalid API Key' });
        }
        req.userByApiKey = user;
        next();
    } catch (error) {
        console.error('API Key check error:', error);
        res.status(500).json({ message: 'Server error during API Key validation' });
    }
};
router.get('/promos', async (req, res) => {
  try {
    const promos = await Promo.find({ isActive: true, endDate: { $gte: new Date() } })
                              .select('title description code discountPercentage endDate');
    res.json(promos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});
router.get('/premium-data', checkApiKey, (req, res) => {
    if (!req.userByApiKey.isPremium) {
        return res.status(403).json({ message: 'Akses ditolak. Akun Anda bukan premium.' });
    }
    if (req.userByApiKey.premiumExpiryDate && new Date() > new Date(req.userByApiKey.premiumExpiryDate)) {
        return res.status(403).json({ message: 'Akses premium Anda telah berakhir.' });
    }

    res.json({
        message: `Welcome premium user ${req.userByApiKey.username}! Here is your exclusive data.`,
        data: {
            secretInfo: "This is some premium content.",
            usageQuota: 1000,
            apiKeyValidFor: req.userByApiKey.username
        }
    });
});
router.get('/check-premium-status', checkApiKey, (req, res) => {
    res.json({
        username: req.userByApiKey.username,
        isPremium: req.userByApiKey.isPremium,
        premiumExpiryDate: req.userByApiKey.premiumExpiryDate,
        apiKey: req.userByApiKey.apiKey 
    });
});


module.exports = router;
