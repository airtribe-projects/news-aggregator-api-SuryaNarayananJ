const newsService = require('./newsService');
const articleModel = require('../models/articleModel');
const userModel = require('../models/userModel');

// In-memory cache map: key -> { data, timestamp }
const cacheStore = new Map();

// Default TTL: 5 minutes
const DEFAULT_TTL_MS = 5 * 60 * 1000;

/**
 * Generate a canonical cache key from a user's preferences list.
 * @param {string[]} preferences 
 * @returns {string}
 */
function getPreferencesCacheKey(preferences) {
    if (!Array.isArray(preferences) || preferences.length === 0) {
        return 'default_headlines';
    }
    // Sort and lowercase to ensure canonical key
    return preferences
        .map(p => p.trim().toLowerCase())
        .sort()
        .join(',');
}

/**
 * Retrieve cached articles for a key if not expired.
 * @param {string} key 
 * @param {number} ttlMs 
 * @returns {object[]|null} Cached articles or null if cache miss/expired
 */
function get(key, ttlMs = DEFAULT_TTL_MS) {
    const entry = cacheStore.get(key);
    if (!entry) return null;
    
    const isExpired = Date.now() - entry.timestamp > ttlMs;
    if (isExpired) {
        cacheStore.delete(key);
        return null;
    }
    
    return entry.data;
}

/**
 * Store articles in the cache.
 * @param {string} key 
 * @param {object[]} articles 
 */
function set(key, articles) {
    cacheStore.set(key, {
        data: articles,
        timestamp: Date.now()
    });
}

/**
 * Get cached articles or fetch fresh ones, assign article IDs, and cache the result.
 * @param {string[]} preferences 
 * @param {number} ttlMs 
 * @returns {Promise<object[]>}
 */
async function getOrFetchNews(preferences, ttlMs = DEFAULT_TTL_MS) {
    const cacheKey = getPreferencesCacheKey(preferences);
    const cachedData = get(cacheKey, ttlMs);
    
    if (cachedData) {
        console.log(`Cache HIT for key: ${cacheKey}`);
        return cachedData;
    }
    
    console.log(`Cache MISS for key: ${cacheKey}. Fetching fresh news...`);
    const rawArticles = await newsService.fetchNewsByPreferences(preferences);
    
    // Save articles in the articleStore and generate IDs
    const articlesWithIds = articleModel.saveArticles(rawArticles);
    
    // Cache the result
    set(cacheKey, articlesWithIds);
    return articlesWithIds;
}

/**
 * Update cached articles for a given key.
 * Used by background scheduler.
 * @param {string[]} preferences 
 */
async function updateCacheEntry(preferences) {
    const cacheKey = getPreferencesCacheKey(preferences);
    try {
        console.log(`Background updating cache for key: ${cacheKey}`);
        const rawArticles = await newsService.fetchNewsByPreferences(preferences);
        const articlesWithIds = articleModel.saveArticles(rawArticles);
        set(cacheKey, articlesWithIds);
    } catch (err) {
        console.error(`Background update failed for key: ${cacheKey}`, err.message);
    }
}

/**
 * Periodically refresh cached news for all registered users in the background.
 * @param {number} intervalMs 
 * @returns {object} Timer object
 */
function startBackgroundScheduler(intervalMs = 10 * 60 * 1000) {
    const timer = setInterval(async () => {
        console.log('Background cache scheduler triggered...');
        
        // 1. Gather all unique preferences from registered users
        const uniqueKeys = new Set();
        const uniquePreferenceSets = [];
        
        // Always include default headlines
        uniquePreferenceSets.push([]);
        
        // Get all users from User model
        const allUsers = userModel._users || [];
        for (const user of allUsers) {
            const cacheKey = getPreferencesCacheKey(user.preferences);
            if (!uniqueKeys.has(cacheKey)) {
                uniqueKeys.add(cacheKey);
                uniquePreferenceSets.push(user.preferences);
            }
        }
        
        // 2. Perform updates sequentially or in parallel
        for (const prefSet of uniquePreferenceSets) {
            await updateCacheEntry(prefSet);
        }
        
        console.log('Background cache scheduler update complete.');
    }, intervalMs);
    
    // Unref timer so that it doesn't prevent Node process from exiting
    if (timer.unref) {
        timer.unref();
    }
    
    return timer;
}

module.exports = {
    getPreferencesCacheKey,
    get,
    set,
    getOrFetchNews,
    startBackgroundScheduler,
    _cacheStore: cacheStore
};
