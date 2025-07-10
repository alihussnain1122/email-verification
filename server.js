require('dotenv').config();
const express =require('express');
const mongoose= require('mongoose');
const authRoutes= require('../backend/routes/authRoutes');
const cors = require('cors');

const app= express();
app.use(cors({
    origin: 'http://localhost:5173', // Ya jo bhi aapka frontend URL hai
    credentials: true
}));
app.use(express.json());
app.use('/api/auth',authRoutes);


mongoose.connect("mongodb://localhost:27017/verification")
    .then(()=>{
        console.log('mongodb connected')
        app.listen(5000, ()=> console.log("server running on port 5000"));
    })
    .catch(err => console.error(err));