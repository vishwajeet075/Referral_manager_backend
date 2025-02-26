
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');
dotenv.config()

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
  
    const user = new User({ name, email, password });
    await user.save();
    

    res.status(201).json({ 
      message: 'User created successfully',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});







router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    
    const user = await User.findOne({ email });

   
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

   
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Determine token expiration based on rememberMe
    const expiresIn = rememberMe ? '7d' : '2h';

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    console.log("Generated token:", token); // Debugging

    // Send response with token and user info
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});













 

  const SECRET_KEY = process.env.JWT_SECRET; 
  
  router.post("/verify", (req, res) => {
    const authHeader = req.headers.authorization;
  
    const token = authHeader?.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
  
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("Token verification error:", err); // Debugging
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      res.status(200).json({ message: "Token is valid", user: decoded ,isValid :true });
    });
  });
  

  


module.exports = router;