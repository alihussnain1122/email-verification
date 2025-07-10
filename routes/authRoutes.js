const express= require('express');
const  {register, verifyEmail}= require('../controllers/authController');
const router= express.Router();

router.post('/register', register);
router.get('/verify/:token', verifyEmail);

module.exports=router;