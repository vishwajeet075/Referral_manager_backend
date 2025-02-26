const express = require('express');
const router = express.Router();
const requireAuth= require('../middleware/authMiddleware');
const User=require('../models/User');
const Referral = require('../models/Referral');

// Generate referral link
router.post('/generate-referral', requireAuth, async (req, res) => {
    console.log("request for generating referall reaches backend");
  try {
    const userId = req.user.id;

    // Check if the user already has a referral ID
    const existingReferral = await Referral.findOne({ userId });
    if (existingReferral) {
      return res.status(200).json({ referralId: existingReferral.referralId });
    }

    // Generate a unique referral ID
    const referralId = generateReferralId(); // Implement this function

    // Create a new referral record
    const newReferral = new Referral({
      userId,
      referralId,
      referrals: 0,
      points: 0,
      rewards: 0,
    });

    await newReferral.save();



    res.status(201).json({ referralId });
  } catch (err) {
    console.error('Referral generation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


const generateReferralId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};









// POST /referral/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, referral_token } = req.body;

  try {
    // Step 1: Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Step 2: Create and save the new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    // Step 3: Handle referral logic if referral_token is provided
    if (referral_token) {
      // Find the referral record by referralId
      const referralRecord = await Referral.findOne({ referralId: referral_token });
      if (!referralRecord) {
        return res.status(400).json({ message: 'Invalid referral token' });
      }

      // Step 4: Update the referring user's referral count, points, and rewards
      referralRecord.referrals += 1; // Increment referral count
      referralRecord.points += 50; // Add 50 points for each referral

      // Calculate reward level (e.g., level 1 after 100 points)
      if (referralRecord.points >= 100) {
        referralRecord.rewards = 1; // Set reward level to 1
      }

      // Save the updated referral record
      await referralRecord.save();
    }

    // Step 5: Return success response
    res.status(201).json({ message: 'Signup successful', user: newUser });
  } catch (error) {
    console.error('Error during referral signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;