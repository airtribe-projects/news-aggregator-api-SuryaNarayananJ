const users = [];

/**
 * Find user by email
 * @param {string} email 
 * @returns {object|null}
 */
function findByEmail(email) {
    if (!email) return null;
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Create a new user
 * @param {object} userData 
 * @returns {object}
 */
function create({ name, email, password, preferences = [] }) {
    const newUser = {
        name,
        email: email.toLowerCase(),
        password, // already hashed
        preferences: Array.isArray(preferences) ? preferences : [],
        readArticles: [],
        favoriteArticles: []
    };
    users.push(newUser);
    return newUser;
}

/**
 * Update user preferences
 * @param {string} email 
 * @param {string[]} preferences 
 * @returns {object|null}
 */
function updatePreferences(email, preferences) {
    const user = findByEmail(email);
    if (!user) return null;
    user.preferences = Array.isArray(preferences) ? preferences : [];
    return user;
}

/**
 * Mark an article as read for the user
 * @param {string} email 
 * @param {string} articleId 
 * @returns {boolean}
 */
function addReadArticle(email, articleId) {
    const user = findByEmail(email);
    if (!user) return false;
    if (!user.readArticles.includes(articleId)) {
        user.readArticles.push(articleId);
        return true;
    }
    return false;
}

/**
 * Mark an article as a favorite for the user
 * @param {string} email 
 * @param {string} articleId 
 * @returns {boolean}
 */
function addFavoriteArticle(email, articleId) {
    const user = findByEmail(email);
    if (!user) return false;
    if (!user.favoriteArticles.includes(articleId)) {
        user.favoriteArticles.push(articleId);
        return true;
    }
    return false;
}

/**
 * Retrieve read article IDs for the user
 * @param {string} email 
 * @returns {string[]}
 */
function getReadArticles(email) {
    const user = findByEmail(email);
    return user ? user.readArticles : [];
}

/**
 * Retrieve favorite article IDs for the user
 * @param {string} email 
 * @returns {string[]}
 */
function getFavoriteArticles(email) {
    const user = findByEmail(email);
    return user ? user.favoriteArticles : [];
}

module.exports = {
    findByEmail,
    create,
    updatePreferences,
    addReadArticle,
    addFavoriteArticle,
    getReadArticles,
    getFavoriteArticles,
    _users: users
};
