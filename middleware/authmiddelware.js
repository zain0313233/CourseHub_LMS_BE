const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access Token is Required"
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token has expired"
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({
                success: false,
                message: "Token not active yet"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Authentication error"
        });
    }
};

const getAccessToken = (userId) => {
    try {
        const token = jwt.sign({
            userId,
            type: 'access'
        }, process.env.JWT_SECRET,
        { expiresIn: '15m' });
        
        const refreshToken = jwt.sign({
            userId,
            type: 'refresh'
        }, process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' });
        
        return {
            accessToken: token,
            refreshToken: refreshToken
        };
        
    } catch (error) {
        console.error('Token generation error:', error);
        throw new Error('Failed to generate tokens');
    }
};

module.exports = {
    authMiddleware,
    getAccessToken
};