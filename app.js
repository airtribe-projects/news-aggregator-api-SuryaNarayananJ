const express = require('express');
const config = require('./config/config');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');
const userController = require('./controllers/userController');
const { validateSignup } = require('./middlewares/validation');
const cacheService = require('./services/cacheService');

const app = express();
const port = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount modular MVC routes
app.use('/users', userRoutes);
app.use('/news', newsRoutes);

// Root level aliases for compatibility with Requirement.docx
app.post('/register', validateSignup, userController.signup);
app.post('/login', userController.login);

// Global Error Handler for JSON parsing issues and unexpected errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ message: 'Invalid JSON payload' });
    }
    console.error('Unhandled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
});

// Start background cache scheduler (refreshes caches every 10 minutes)
const isTesting = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test.js'));

// Start background cache scheduler (refreshes caches every 10 minutes)
if (!isTesting) {
    cacheService.startBackgroundScheduler(10 * 60 * 1000);
}

if (!isTesting) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;