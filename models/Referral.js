const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  referralId: { type: String, required: true, unique: true },
  referrals: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  rewards: { type: Number, default: 0 },
});

module.exports = mongoose.model('Referral', referralSchema);