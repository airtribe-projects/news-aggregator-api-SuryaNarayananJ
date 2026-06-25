const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userModel = require('../models/userModel');

/**
 * Middleware to authenticate requests using JWT
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    // Extract bearer token
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        
        // Find user by email from the decoded token payload
        const user = userModel.findByEmail(decoded.email);
        if (!user) {
            return res.status(401).json({ message: 'User no longer exists or invalid token' });
        }

        // Attach user info to request
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired access token' });
    }
}

module.exports = authMiddleware;
