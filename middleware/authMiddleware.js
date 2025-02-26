// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authorization = req.header('Authorization');
    
    if (!authorization) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    
    // Check if it's a Bearer token
    if (!authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid token format.' });
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports =requireAuth;