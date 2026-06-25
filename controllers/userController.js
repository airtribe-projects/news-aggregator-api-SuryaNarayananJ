const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userModel = require('../models/userModel');

/**
 * Handles user signup
 */
async function signup(req, res) {
    try {
        const { name, email, password, preferences } = req.body;

        // Check if user already exists
        const existingUser = userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user
        userModel.create({
            name,
            email,
            password: hashedPassword,
            preferences
        });

        return res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({ message: 'Internal server error during signup' });
    }
}

/**
 * Handles user login
 */
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user
        const user = userModel.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { email: user.email },
            config.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({ token });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error during login' });
    }
}

/**
 * Handles retrieving user preferences
 */
function getPreferences(req, res) {
    try {
        // req.user is set by authMiddleware
        return res.status(200).json({ preferences: req.user.preferences });
    } catch (error) {
        console.error('Get preferences error:', error);
        return res.status(500).json({ message: 'Internal server error fetching preferences' });
    }
}

/**
 * Handles updating user preferences
 */
function updatePreferences(req, res) {
    try {
        const { preferences } = req.body;
        const email = req.user.email;

        const updatedUser = userModel.updatePreferences(email, preferences);
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Preferences updated successfully',
            preferences: updatedUser.preferences
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        return res.status(500).json({ message: 'Internal server error updating preferences' });
    }
}

module.exports = {
    signup,
    login,
    getPreferences,
    updatePreferences
};
