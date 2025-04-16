const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        req.flash('error_msg', 'Please log in to access this page');
        res.redirect('/auth/login');
    }
};

// Dashboard routes
router.get('/', isAuthenticated, dashboardController.getDashboard);
router.get('/friends', isAuthenticated, dashboardController.getFriendsList);

// Friend request routes
router.post('/friend-request/:userId', isAuthenticated, dashboardController.sendFriendRequest);
router.post('/friend-request/:requestId/accept', isAuthenticated, dashboardController.acceptFriendRequest);
router.post('/friend-request/:requestId/reject', isAuthenticated, dashboardController.rejectFriendRequest);

module.exports = router; 