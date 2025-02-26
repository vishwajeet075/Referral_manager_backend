// routes/ProfileRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Profile = require('../models/Profile');
const Referral = require('../models/Referral');
const requireAuth = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});


router.post('/set_profile', requireAuth, upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, bio } = req.body;
    
    // Parse links from JSON string
    let links = [];
    if (req.body.links) {
      try {
        links = JSON.parse(req.body.links);
      } catch (err) {
        return res.status(400).json({ error: 'Invalid links format' });
      }
    }

    // Profile picture path
    const profilePicturePath = req.file ? req.file.path : '';

    // Create new profile
    const profile = new Profile({
      user: req.user.id,
      name,
      bio,
      profilePicture: profilePicturePath,
      links
    });
    
    await profile.save();

    res.status(201).json({message: 'Profile created successfully'});
  } catch (err) {
    console.error('Profile creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});







router.get('/get_profile', requireAuth, async (req, res) => {
  try {
    // Fetch the user's profile
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Construct the full image URL
    const profilePictureUrl = profile.profilePicture
      ? `${req.protocol}://${req.get('host')}/${profile.profilePicture}`
      : '';

    // Fetch the referral data for the user
    const referralData = await Referral.findOne({ userId: req.user.id });

    // Prepare the response object
    const response = {
      profile: {
        name: profile.name,
        bio: profile.bio,
        profilePicture: profilePictureUrl, // Send full image URL
        links: profile.links,
        referrals: referralData ? referralData.referrals : 0,
        points: referralData ? referralData.points : 0,
        rewards: referralData ? referralData.rewards : 0,
      }
    };

    // Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});






router.get('/check', requireAuth, async (req, res) => {
  console.log("Request for check reaches backend");
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(200).json({ exists: false }); // Return false if profile doesn't exist
    } else {
      return res.status(200).json({ exists: true }); // Return true if profile exists
    }

  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;