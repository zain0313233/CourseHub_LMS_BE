const User = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const { authMiddleware, getAccessToken } = require('../middleware/authmiddelware');
const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { 
            name, 
            email, 
            phone, 
            country, 
            address, 
            dateOfBirth, 
            password, 
            role, 
            educationLevel, 
            experience, 
            subjects,
            batch,
            status, 
            bio, 
            learningGoals 
        } = req.body;

        if (!name || !email || !phone || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Required fields are missing'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const profileData = role === 'teacher' 
            ? {
                educationLevel,
                experience: parseInt(experience) || 0,
                subjects,
                batch,
                bio
              }
            : {
                educationLevel,
                learningGoals,
                bio
              };

        const user = new User({
            name,
            email,
            phone,
            country,
            address,
            dateOfBirth,
            password: hashedPassword,
            role,
            profile: profileData,
            status,
        });

        await user.save();

        const tokens = getAccessToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                createdAt: user.createdAt,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during account creation',
            error: error.message
        });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const tokens = getAccessToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                country: user.country,
                profile: user.profile
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
});

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                country: user.country,
                address: user.address,
                dateOfBirth: user.dateOfBirth,
                role: user.role,
                profile: user.profile,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
});

router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { 
            name, 
            phone, 
            country, 
            address, 
            dateOfBirth, 
            educationLevel, 
            experience, 
            subjects, 
            bio, 
            learningGoals 
        } = req.body;

        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updateData = {
            name: name || user.name,
            phone: phone || user.phone,
            country: country || user.country,
            address: address || user.address,
            dateOfBirth: dateOfBirth || user.dateOfBirth
        };

        const profileData = user.role === 'teacher' 
            ? {
                ...user.profile,
                educationLevel: educationLevel || user.profile.educationLevel,
                experience: experience !== undefined ? parseInt(experience) : user.profile.experience,
                subjects: subjects || user.profile.subjects,
                bio: bio || user.profile.bio
              }
            : {
                ...user.profile,
                educationLevel: educationLevel || user.profile.educationLevel,
                learningGoals: learningGoals || user.profile.learningGoals,
                bio: bio || user.profile.bio
              };

        updateData.profile = profileData;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId, 
            updateData, 
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile',
            error: error.message
        });
    }
});

router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

router.delete('/account', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(req.user.userId);

        res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error deleting account',
            error: error.message
        });
    }
});

module.exports = router;