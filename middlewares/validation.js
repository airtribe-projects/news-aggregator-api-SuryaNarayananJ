/**
 * Middleware functions for request input validation
 */

// Simple regex for basic email format validation
const emailRegex = /^\S+@\S+\.\S+$/;

/**
 * Validate user signup inputs
 */
function validateSignup(req, res, next) {
    const { name, email, password, preferences } = req.body;

    // Check missing fields
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Missing fields: name, email, and password are required' });
    }

    // Validate email format
    if (typeof email !== 'string' || !emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate password length (min 6 characters)
    if (typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Validate preferences if provided
    if (preferences && !Array.isArray(preferences)) {
        return res.status(400).json({ message: 'Preferences must be an array of strings' });
    }

    next();
}

/**
 * Validate news preferences update input
 */
function validatePreferences(req, res, next) {
    const { preferences } = req.body;

    if (!preferences || !Array.isArray(preferences)) {
        return res.status(400).json({ message: 'Preferences field is required and must be an array of strings' });
    }

    // Check that every element is a string
    const allStrings = preferences.every(item => typeof item === 'string');
    if (!allStrings) {
        return res.status(400).json({ message: 'All items in preferences array must be strings' });
    }

    next();
}

module.exports = {
    validateSignup,
    validatePreferences
};
