const crypto = require('crypto');

// In-memory catalog mapping: id -> full_article_data
const articleStore = new Map();

/**
 * Generate a deterministic ID for an article based on its URL or title.
 * @param {object} article 
 * @returns {string}
 */
function generateId(article) {
    const data = article.url || article.title || JSON.stringify(article);
    return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Assign IDs to articles, save them in the store, and return articles with the 'id' field included.
 * @param {object[]} articles 
 * @returns {object[]}
 */
function saveArticles(articles) {
    if (!Array.isArray(articles)) return [];
    
    return articles.map(art => {
        const id = generateId(art);
        const savedArt = { id, ...art };
        articleStore.set(id, savedArt);
        return savedArt;
    });
}

/**
 * Get an article by its ID.
 * @param {string} id 
 * @returns {object|null}
 */
function getArticleById(id) {
    return articleStore.get(id) || null;
}

/**
 * Get multiple articles by their IDs.
 * @param {string[]} ids 
 * @returns {object[]}
 */
function getArticlesByIds(ids) {
    if (!Array.isArray(ids)) return [];
    const results = [];
    for (const id of ids) {
        const art = getArticleById(id);
        if (art) {
            results.push(art);
        }
    }
    return results;
}

module.exports = {
    generateId,
    saveArticles,
    getArticleById,
    getArticlesByIds,
    _articleStore: articleStore
};
