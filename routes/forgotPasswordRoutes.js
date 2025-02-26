const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PasswordReset = require("../models/PasswordReset");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Create a new password reset document
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken,
    });

    await passwordReset.save();

    // Send the reset email
    const resetUrl = `https://referral-manager.netlify.app/reset/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset",
      html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Password reset link sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Validate Reset Token Route
router.get("/validate-reset-token/:token", async (req, res) => {
  console.log("Requesst reached the backend");
  const { token } = req.params;

  try {
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    res.status(200).json({ message: "Token is valid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const passwordReset = await PasswordReset.findOne({ token });

    if (!passwordReset) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(passwordReset.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    
    user.password = newPassword;

    await user.save();

    // Delete the reset token
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

module.exports = router;
