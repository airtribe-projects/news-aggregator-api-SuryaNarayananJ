process.env.NODE_ENV = 'test';

const tap = require('tap');
const supertest = require('supertest');
const app = require('../app');
const server = supertest(app);

const mockUser = {
    name: 'Custom User',
    email: 'custom@user.com',
    password: 'securePassword123',
    preferences: ['movies', 'tech']
};

let token = '';
let articleId = '';

// Test registration alias POST /register
tap.test('POST /register', async (t) => {
    const response = await server.post('/register').send(mockUser);
    t.equal(response.status, 200);
    t.end();
});

// Test duplicate signup validation
tap.test('POST /register - duplicate email', async (t) => {
    const response = await server.post('/register').send(mockUser);
    t.equal(response.status, 400);
    t.end();
});

// Test input validation - invalid email format
tap.test('POST /register - invalid email', async (t) => {
    const response = await server.post('/register').send({
        name: 'Invalid User',
        email: 'bad-email-format',
        password: 'password123'
    });
    t.equal(response.status, 400);
    t.end();
});

// Test input validation - password too short
tap.test('POST /register - short password', async (t) => {
    const response = await server.post('/register').send({
        name: 'Short Pass User',
        email: 'short@pass.com',
        password: '123'
    });
    t.equal(response.status, 400);
    t.end();
});

// Test login alias POST /login
tap.test('POST /login', async (t) => {
    const response = await server.post('/login').send({
        email: mockUser.email,
        password: mockUser.password
    });
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'token');
    token = response.body.token;
    t.end();
});

// Test login with invalid credentials
tap.test('POST /login - invalid credentials', async (t) => {
    const response = await server.post('/login').send({
        email: mockUser.email,
        password: 'wrongPassword'
    });
    t.equal(response.status, 401);
    t.end();
});

// Test news preferences validation
tap.test('PUT /users/preferences - invalid structure', async (t) => {
    const response = await server
        .put('/users/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({ preferences: 'not-an-array' });
    t.equal(response.status, 400);
    t.end();
});

// Test getting news feed and capturing article ID
tap.test('GET /news - fetch news', async (t) => {
    const response = await server
        .get('/news')
        .set('Authorization', `Bearer ${token}`);
    
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.type(response.body.news, 'object'); // returns array of articles
    
    if (response.body.news && response.body.news.length > 0) {
        t.hasOwnProp(response.body.news[0], 'id');
        articleId = response.body.news[0].id;
    }
    t.end();
});

// Test marking article as read
tap.test('POST /news/:id/read', async (t) => {
    if (!articleId) {
        t.skip('Skipping: no article ID available to mark read');
        return t.end();
    }
    const response = await server
        .post(`/news/${articleId}/read`)
        .set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.end();
});

// Test retrieve read articles list
tap.test('GET /news/read', async (t) => {
    const response = await server
        .get('/news/read')
        .set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    if (articleId) {
        const hasArticle = response.body.news.some(art => art.id === articleId);
        t.ok(hasArticle, 'Should contain the marked read article');
    }
    t.end();
});

// Test marking article as favorite
tap.test('POST /news/:id/favorite', async (t) => {
    if (!articleId) {
        t.skip('Skipping: no article ID available to mark favorite');
        return t.end();
    }
    const response = await server
        .post(`/news/${articleId}/favorite`)
        .set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.end();
});

// Test retrieve favorite articles list
tap.test('GET /news/favorites', async (t) => {
    const response = await server
        .get('/news/favorites')
        .set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    if (articleId) {
        const hasArticle = response.body.news.some(art => art.id === articleId);
        t.ok(hasArticle, 'Should contain the favorited article');
    }
    t.end();
});

// Test search news functionality
tap.test('GET /news/search/:keyword', async (t) => {
    const response = await server
        .get('/news/search/comics')
        .set('Authorization', `Bearer ${token}`);
    t.equal(response.status, 200);
    t.hasOwnProp(response.body, 'news');
    t.end();
});

// Cleanup tap
tap.teardown(() => {
    process.exit(0);
});
