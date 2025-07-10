const User = require('../models/user');
const express =require('express')
const router=express.Router();
router.post('/create-user', async (req, res) => {
    try {
        const { name, email, password, role, profile } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        const user = new User({
            name,
            email,
            password,
            role,
            profile
        });

        await user.save();

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            error: error.message
        });
    }
});
module.exports=router;