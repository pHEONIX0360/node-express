const Post = require('../models/Post');

// Get all posts
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.render('posts/index', { 
            title: 'All Posts',
            posts 
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching posts');
        res.redirect('/');
    }
};

// Get single post
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');
        
        if (!post) {
            req.flash('error_msg', 'Post not found');
            return res.redirect('/posts');
        }

        res.render('posts/show', { 
            title: post.title,
            post 
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching post');
        res.redirect('/posts');
    }
};

// Create post form
exports.createPostForm = (req, res) => {
    res.render('posts/create', { title: 'Create Post' });
};

// Create post
exports.createPost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const post = new Post({
            title,
            content,
            author: req.session.userId,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });

        await post.save();
        req.flash('success_msg', 'Post created successfully');
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error creating post');
        res.redirect('/posts/new');
    }
};

// Edit post form
exports.editPostForm = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            req.flash('error_msg', 'Post not found');
            return res.redirect('/posts');
        }

        // Check if user is author
        if (post.author.toString() !== req.session.userId) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/posts');
        }

        res.render('posts/edit', { 
            title: 'Edit Post',
            post 
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error fetching post');
        res.redirect('/posts');
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            req.flash('error_msg', 'Post not found');
            return res.redirect('/posts');
        }

        // Check if user is author
        if (post.author.toString() !== req.session.userId) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/posts');
        }

        post.title = title;
        post.content = content;
        post.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];

        await post.save();
        req.flash('success_msg', 'Post updated successfully');
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating post');
        res.redirect('/posts');
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            req.flash('error_msg', 'Post not found');
            return res.redirect('/posts');
        }

        // Check if user is author
        if (post.author.toString() !== req.session.userId) {
            req.flash('error_msg', 'Not authorized');
            return res.redirect('/posts');
        }

        await post.deleteOne();
        req.flash('success_msg', 'Post deleted successfully');
        res.redirect('/posts');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error deleting post');
        res.redirect('/posts');
    }
};

// Add comment
exports.addComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            req.flash('error_msg', 'Post not found');
            return res.redirect('/posts');
        }

        post.comments.unshift({
            user: req.session.userId,
            text: req.body.text
        });

        await post.save();
        req.flash('success_msg', 'Comment added successfully');
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error adding comment');
        res.redirect('/posts');
    }
}; 