const axios = require('axios');
const config = require('../config/config');

const isTesting = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test.js'));

// Standard mock articles for testing environment
const mockArticles = [
    {
        title: 'Mock Article 1',
        description: 'This is the first mock news article for testing.',
        content: 'Content of mock news article 1. This is a placeholder.',
        url: 'https://example.com/mock-article-1',
        image: 'https://example.com/image1.jpg',
        publishedAt: '2026-06-25T06:00:00Z',
        source: {
            name: 'Mock News Source',
            url: 'https://example.com'
        }
    },
    {
        title: 'Mock Article 2',
        description: 'This is the second mock news article for testing.',
        content: 'Content of mock news article 2. This is a placeholder.',
        url: 'https://example.com/mock-article-2',
        image: 'https://example.com/image2.jpg',
        publishedAt: '2026-06-25T06:05:00Z',
        source: {
            name: 'Mock News Source',
            url: 'https://example.com'
        }
    }
];

/**
 * Fetch top headlines from GNews API
 * @param {object} params Additional query parameters
 * @returns {Promise<object[]>} Articles list
 */
async function fetchTopHeadlines(params = {}) {
    if (isTesting) {
        return [...mockArticles];
    }

    try {
        const response = await axios.get(`${config.NEWS_API_BASE_URL}/top-headlines`, {
            params: {
                apikey: config.NEWS_API_KEY,
                lang: 'en',
                max: 10,
                ...params
            }
        });
        
        return response.data.articles || [];
    } catch (error) {
        console.error('Error fetching top headlines from GNews API:', error.message);
        throw new Error('Failed to fetch news from external service');
    }
}

/**
 * Search articles from GNews API
 * @param {string} query Search query string
 * @param {object} params Additional query parameters
 * @returns {Promise<object[]>} Articles list
 */
async function searchNewsArticles(query, params = {}) {
    if (isTesting) {
        // Return mock articles containing the query word if we want to simulate search, or just return them
        return mockArticles.map(art => ({
            ...art,
            title: `[Search: ${query}] ${art.title}`
        }));
    }

    if (!query) {
        return fetchTopHeadlines(params);
    }
    
    try {
        const response = await axios.get(`${config.NEWS_API_BASE_URL}/search`, {
            params: {
                q: query,
                apikey: config.NEWS_API_KEY,
                lang: 'en',
                max: 10,
                ...params
            }
        });
        
        return response.data.articles || [];
    } catch (error) {
        console.error(`Error searching articles for query "${query}":`, error.message);
        throw new Error('Failed to search news from external service');
    }
}

/**
 * Fetch news based on user preferences
 * @param {string[]} preferences List of preferred keywords
 * @returns {Promise<object[]>} Articles list
 */
async function fetchNewsByPreferences(preferences) {
    if (isTesting) {
        return mockArticles.map(art => ({
            ...art,
            title: `[Pref: ${preferences.join(',')}] ${art.title}`
        }));
    }

    if (!Array.isArray(preferences) || preferences.length === 0) {
        return fetchTopHeadlines();
    }
    
    // Construct query: e.g. "movies" OR "comics"
    const query = preferences
        .map(pref => `"${pref.trim()}"`)
        .join(' OR ');
        
    return searchNewsArticles(query);
}

module.exports = {
    fetchTopHeadlines,
    searchNewsArticles,
    fetchNewsByPreferences
};
