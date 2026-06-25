# News Aggregator API

[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=24178257&assignment_repo_type=AssignmentRepo)

A professional RESTful API for a News Aggregator service built with **Node.js**, **Express**, and **GNews API**. This application handles user authentication, customized news feed fetching based on user preferences, in-memory caching, read/favorite article cataloging, and keyword searching.

The codebase is built following standard **MVC (Model-View-Controller)** pattern separation.

---

## Folder Structure
```text
├── config/
│   └── config.js            # Environment configuration loader
├── models/
│   ├── userModel.js         # User registry & read/favorite article list mappings
│   └── articleModel.js      # Article storage catalog mapping string IDs to metadata
├── controllers/
│   ├── userController.js    # Auth flow, registration, and preference handlers
│   └── newsController.js    # News feed, searches, and read/favorite handlers
├── routes/
│   ├── userRoutes.js        # Express endpoints routing for users (/users)
│   └── newsRoutes.js        # Express endpoints routing for news (/news)
├── services/
│   ├── newsService.js       # External integration wrapper for gnews.io API
│   └── cacheService.js      # News feed caching mechanism and background scheduling
├── middlewares/
│   ├── authMiddleware.js    # JWT authorization validator
│   └── validation.js        # Email/password validation middleware
├── custom-tests/            # Custom integration testing directory
│   └── custom.test.js       # Custom tests for optional endpoints
├── test/                    # Classroom bot grading tests
│   └── server.test.js
├── .env                     # Local environment settings configuration
├── app.js                   # Main application bootstrap
└── package.json
```

---

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure `.env`**:
   The root `.env` holds configuration details:
   ```env
   PORT=3000
   JWT_SECRET=super_secret_jwt_key_123!
   NEWS_API_KEY=f17559c62d4d4e75809c941c6487b00e
   NEWS_API_BASE_URL=https://gnews.io/api/v4
   ```

3. **Start the Server**:
   ```bash
   node app.js
   ```

---

## API Documentation

### 1. Authentication & Users
*   **POST `/users/signup`** (or `/register`):
    *   *Body*: `{ "name": "Clark Kent", "email": "clark@superman.com", "password": "Krypt()n8", "preferences": ["movies", "comics"] }`
    *   Registers a new user and hashes the password using `bcryptjs`.
*   **POST `/users/login`** (or `/login`):
    *   *Body*: `{ "email": "clark@superman.com", "password": "Krypt()n8" }`
    *   Verifies credentials and returns a JWT Bearer token `{ "token": "..." }`.
*   **GET `/users/preferences`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Returns the active user's preferences list.
*   **PUT `/users/preferences`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   *Body*: `{ "preferences": ["sports", "movies"] }`
    *   Updates user preferences.

### 2. News Feed & Actions
*   **GET `/news`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Fetches the news feed matching user preferences from the cache or GNews API.
*   **POST `/news/:id/read`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Marks the specified article (by unique ID) as read.
*   **POST `/news/:id/favorite`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Marks the specified article (by unique ID) as a favorite.
*   **GET `/news/read`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Retrieves all news articles marked as read by the user.
*   **GET `/news/favorites`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Retrieves all news articles marked as favorite by the user.
*   **GET `/news/search/:keyword`**:
    *   *Headers*: `Authorization: Bearer <token>`
    *   Searches news articles by a specific keyword via GNews API.

---

## Testing

*   **Classroom Tests (Teacher Suite)**:
    ```bash
    $env:NODE_ENV="test"; node test/server.test.js
    ```
    *(For automated grading bot execution)*:
    ```bash
    npm test
    ```

*   **Custom Test Suite (MVC & Optional Endpoints)**:
    ```bash
    node custom-tests/custom.test.js
    ```
    *(Runs via npm script)*:
    ```bash
    npm run test:custom
    ```
