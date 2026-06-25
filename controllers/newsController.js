const cacheService = require('../services/cacheService');
const newsService = require('../services/newsService');
const articleModel = require('../models/articleModel');
const userModel = require('../models/userModel');

/**
 * Get news feed based on user preferences (with caching)
 */
async function getNewsFeed(req, res) {
    try {
        const preferences = req.user.preferences || [];
        const news = await cacheService.getOrFetchNews(preferences);
        return res.status(200).json({ news });
    } catch (error) {
        console.error('Error in getNewsFeed:', error.message);
        return res.status(500).json({ message: 'Internal server error fetching news feed' });
    }
}

/**
 * Mark a news article as read
 */
function markRead(req, res) {
    try {
        const { id } = req.params;
        const email = req.user.email;

        // Check if the article exists in our store
        const article = articleModel.getArticleById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        userModel.addReadArticle(email, id);
        return res.status(200).json({ message: 'Article marked as read successfully' });
    } catch (error) {
        console.error('Error in markRead:', error.message);
        return res.status(500).json({ message: 'Internal server error marking article as read' });
    }
}

/**
 * Mark a news article as favorite
 */
function markFavorite(req, res) {
    try {
        const { id } = req.params;
        const email = req.user.email;

        // Check if the article exists in our store
        const article = articleModel.getArticleById(id);
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        userModel.addFavoriteArticle(email, id);
        return res.status(200).json({ message: 'Article marked as favorite successfully' });
    } catch (error) {
        console.error('Error in markFavorite:', error.message);
        return res.status(500).json({ message: 'Internal server error marking article as favorite' });
    }
}

/**
 * Retrieve all read news articles
 */
function getReadArticles(req, res) {
    try {
        const email = req.user.email;
        const readIds = userModel.getReadArticles(email);
        const articles = articleModel.getArticlesByIds(readIds);
        return res.status(200).json({ news: articles });
    } catch (error) {
        console.error('Error in getReadArticles:', error.message);
        return res.status(500).json({ message: 'Internal server error retrieving read articles' });
    }
}

/**
 * Retrieve all favorite news articles
 */
function getFavoriteArticles(req, res) {
    try {
        const email = req.user.email;
        const favoriteIds = userModel.getFavoriteArticles(email);
        const articles = articleModel.getArticlesByIds(favoriteIds);
        return res.status(200).json({ news: articles });
    } catch (error) {
        console.error('Error in getFavoriteArticles:', error.message);
        return res.status(500).json({ message: 'Internal server error retrieving favorite articles' });
    }
}

/**
 * Search articles by keyword
 */
async function searchNews(req, res) {
    try {
        const { keyword } = req.params;
        if (!keyword) {
            return res.status(400).json({ message: 'Search keyword is required' });
        }

        const rawArticles = await newsService.searchNewsArticles(keyword);
        const articlesWithIds = articleModel.saveArticles(rawArticles);
        
        return res.status(200).json({ news: articlesWithIds });
    } catch (error) {
        console.error(`Error in searchNews for keyword "${req.params.keyword}":`, error.message);
        return res.status(500).json({ message: 'Internal server error searching news' });
    }
}

module.exports = {
    getNewsFeed,
    markRead,
    markFavorite,
    getReadArticles,
    getFavoriteArticles,
    searchNews
};
