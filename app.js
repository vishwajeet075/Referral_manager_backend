const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cors=require('cors');
const path=require('path');
const forgetPasswordRoutes=require('./routes/forgotPasswordRoutes');
const profileRoutes = require('./routes/ProfileRoutes');
const referralRoutes = require('./routes/referralRoutes');





dotenv.config();


connectDB();

const app=express();





app.use(express.json());
app.use(cors({
    origin: 'https://referral-manager.netlify.app' // Replace with your frontend URL
  }));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/auth',authRoutes);
app.use('/forgot',forgetPasswordRoutes)
app.use('/profile', profileRoutes);
app.use('/referral',referralRoutes);


const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})