const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_123!',
    NEWS_API_KEY: process.env.NEWS_API_KEY || 'f17559c62d4d4e75809c941c6487b00e',
    NEWS_API_BASE_URL: process.env.NEWS_API_BASE_URL || 'https://gnews.io/api/v4'
};
