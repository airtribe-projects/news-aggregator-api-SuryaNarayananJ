const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const authMiddleware = require('../middlewares/authMiddleware');

// All news routes are protected
router.get('/', authMiddleware, newsController.getNewsFeed);
router.get('/read', authMiddleware, newsController.getReadArticles);
router.get('/favorites', authMiddleware, newsController.getFavoriteArticles);
router.get('/search/:keyword', authMiddleware, newsController.searchNews);

router.post('/:id/read', authMiddleware, newsController.markRead);
router.post('/:id/favorite', authMiddleware, newsController.markFavorite);

module.exports = router;
