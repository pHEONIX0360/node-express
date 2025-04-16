const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Register route
router.get('/register', (req, res) => {
    res.render('auth/register', { title: 'Register' });
});

router.post('/register', authController.register);

// Login route
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

router.post('/login', authController.login);

// Logout route
router.get('/logout', authController.logout);

module.exports = router; 