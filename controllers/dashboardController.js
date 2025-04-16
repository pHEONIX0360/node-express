const User = require('../models/User');

// Get dashboard with all users
exports.getDashboard = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId)
            .populate('friends', 'username profileImage')
            .populate('friendRequests.from', 'username profileImage');
        
        const users = await User.find({ _id: { $ne: req.session.userId } })
            .select('username profileImage bio')
            .sort({ username: 1 });

        res.render('dashboard/index', {
            title: 'Dashboard',
            currentUser,
            users
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
};

// Send friend request
exports.sendFriendRequest = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.session.userId);

        if (!targetUser || !currentUser) {
            req.flash('error_msg', 'User not found');
            return res.redirect('/dashboard');
        }

        // Check if request already exists
        const existingRequest = targetUser.friendRequests.find(
            request => request.from.toString() === currentUser._id.toString()
        );

        if (existingRequest) {
            req.flash('error_msg', 'Friend request already sent');
            return res.redirect('/dashboard');
        }

        // Add friend request
        targetUser.friendRequests.push({
            from: currentUser._id,
            status: 'pending'
        });

        await targetUser.save();
        req.flash('success_msg', 'Friend request sent successfully');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error sending friend request');
        res.redirect('/dashboard');
    }
};

// Accept friend request
exports.acceptFriendRequest = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const requestId = req.params.requestId;

        const request = currentUser.friendRequests.id(requestId);
        if (!request) {
            req.flash('error_msg', 'Friend request not found');
            return res.redirect('/dashboard');
        }

        // Update request status
        request.status = 'accepted';

        // Add to friends list for both users
        const friend = await User.findById(request.from);
        if (!friend.friends.includes(currentUser._id)) {
            friend.friends.push(currentUser._id);
            await friend.save();
        }

        if (!currentUser.friends.includes(friend._id)) {
            currentUser.friends.push(friend._id);
        }

        await currentUser.save();
        req.flash('success_msg', 'Friend request accepted');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error accepting friend request');
        res.redirect('/dashboard');
    }
};

// Reject friend request
exports.rejectFriendRequest = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId);
        const requestId = req.params.requestId;

        const request = currentUser.friendRequests.id(requestId);
        if (!request) {
            req.flash('error_msg', 'Friend request not found');
            return res.redirect('/dashboard');
        }

        request.status = 'rejected';
        await currentUser.save();

        req.flash('success_msg', 'Friend request rejected');
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error rejecting friend request');
        res.redirect('/dashboard');
    }
};

// View friends list
exports.getFriendsList = async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.userId)
            .populate('friends', 'username profileImage bio');

        res.render('dashboard/friends', {
            title: 'My Friends',
            currentUser
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading friends list');
        res.redirect('/dashboard');
    }
}; 