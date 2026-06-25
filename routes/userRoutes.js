const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { validateSignup, validatePreferences } = require('../middlewares/validation');

// Public routes
router.post('/signup', validateSignup, userController.signup);
router.post('/login', userController.login);

// Protected routes (require JWT)
router.get('/preferences', authMiddleware, userController.getPreferences);
router.put('/preferences', authMiddleware, validatePreferences, userController.updatePreferences);

module.exports = router;
