const mongoose = require('mongoose');
const promoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  code: { type: String, unique: true, sparse: true },
  discountPercentage: { type: Number, min: 0, max: 100 },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Promo = mongoose.model('Promo', promoSchema);
module.exports = Promo;
