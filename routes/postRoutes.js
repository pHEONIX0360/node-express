const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        req.flash('error_msg', 'Please log in to access this page');
        res.redirect('/auth/login');
    }
};

// Get all posts
router.get('/', postController.getAllPosts);

// Create post routes - these need to come before /:id routes
router.get('/new', isAuthenticated, postController.createPostForm);
router.post('/', isAuthenticated, postController.createPost);

// Get single post
router.get('/:id', postController.getPost);

// Edit post routes
router.get('/:id/edit', isAuthenticated, postController.editPostForm);

// Delete post
router.delete('/:id', isAuthenticated, postController.deletePost);

// Add comment
router.post('/:id/comments', isAuthenticated, postController.addComment);

module.exports = router; 