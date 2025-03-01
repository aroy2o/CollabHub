# 🌐 Community Collaboration Platform - Backend

A **highly scalable** and **secure backend** for a **community collaboration platform** that helps users share **ideas, resources, and skills** while collaborating on projects. Built with **Node.js, Express, MongoDB**, and follows best security practices.

## 📜 Features

✅ **Authentication & Authorization** - Secure user signup/login with JWT  
✅ **User Management** - Profiles, roles, and access control  
✅ **Social Features** - Follow/Unfollow users with followers/following tracking  
✅ **Project Collaboration** - Create and manage projects, invite users  
✅ **Posts & Discussions** - Share ideas, updates, and discussions  
✅ **Comments & Feedback** - Engage with posts and projects  
✅ **Security & Performance** - Rate limiting, helmet, CORS, and logging  
✅ **REST API Design** - Modular and scalable  

---

## 🚀 **Tech Stack**

- **Node.js**: Backend runtime
- **Express.js**: Web framework
- **MongoDB (Mongoose)**: NoSQL Database
- **JWT (jsonwebtoken)**: Authentication
- **bcrypt**: Password hashing
- **Helmet.js**: Security headers
- **CORS**: Cross-Origin Requests
- **Multer**: File uploads
- **Winston**: Logging
- **Dotenv**: Environment variables
- **Morgan**: HTTP request logging

---

## 📂 **Folder Structure**
```
backend/
│── src/
│   ├── config/
│   │   ├── auth.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── post.controller.js
│   │   ├── follow.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── post.model.js
│   │   ├── comment.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── post.routes.js
│   │   ├── follow.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── post.service.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   ├── followUtils.js
│── index.js
│── .env
│── package.json
│── Dockerfile
│── .gitignore
│── README.md
```

---

## ⚙️ **Installation & Setup**
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-username/community-collab-backend.git
cd community-collab-backend
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Set Up Environment Variables (.env)
```ini
PORT=5000
MONGO_URI=mongodb://localhost:27017/community
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

### 4️⃣ Run the Server
```sh
npm start
```
or in development mode:
```sh
npm run dev
```

## 📋 **API Endpoints Table**

### Authentication Endpoints

| Method | Endpoint                   | Description                        | Access       |
|--------|----------------------------|------------------------------------|--------------|
| POST   | /api/auth/signup           | Register a new user                | Public       |
| POST   | /api/auth/login            | Login and get JWT token            | Public       |
| POST   | /api/auth/logout           | Logout user                        | Private      |
| GET    | /api/auth/me               | Get logged-in user profile         | Private      |
| PUT    | /api/auth/me               | Update logged-in user profile      | Private      |

### User Management Endpoints

| Method | Endpoint                   | Description                        | Access       |
|--------|----------------------------|------------------------------------|--------------|
| GET    | /api/users                 | Fetch all users                    | Admin        |
| GET    | /api/users/profile/me      | Get logged-in user profile         | Private      |
| PUT    | /api/users/profile/me      | Update logged-in user profile      | Private      |
| DELETE | /api/users/profile/me      | Delete logged-in user account      | Private      |
| GET    | /api/users/:id             | Get user profile by ID             | Public       |
| DELETE | /api/users/:id             | Delete user by ID                  | Owner/Admin  |

### Follow Management Endpoints

| Method | Endpoint                   | Description                        | Access       |
|--------|----------------------------|------------------------------------|--------------|
| POST   | /api/users/follow/:id      | Follow a user                      | Private      |
| POST   | /api/users/unfollow/:id    | Unfollow a user                    | Private      |
| GET    | /api/users/:id/followers   | Get a user's followers             | Public       |
| GET    | /api/users/:id/following   | Get users a user is following      | Public       |
| GET    | /api/users/:id/is-following | Check if logged-in user is following another user | Private |

### Post Endpoints

| Method | Endpoint                     | Description                    | Access        |
|--------|------------------------------|--------------------------------|---------------|
| POST   | /api/posts                   | Create a new post              | Private       |
| GET    | /api/posts                   | Get all posts                  | Public        |
| GET    | /api/posts/:postId           | Get post by ID                 | Public        |
| PUT    | /api/posts/:postId           | Update a post                  | Owner         |
| DELETE | /api/posts/:postId           | Delete a post                  | Owner         |
| POST   | /api/posts/:postId/like      | Like/Unlike a post             | Private       |
| POST   | /api/posts/:postId/comment   | Add a comment to a post        | Private       |
| POST   | /api/posts/:postId/bookmark  | Bookmark/Unbookmark a post     | Private       |
| GET    | /api/posts/bookmarks         | Get all bookmarked posts       | Private       |

---

## 🔑 Authentication

### JWT Implementation
- Tokens expire in 7 days
- Passwords hashed using bcrypt (10 rounds)
- Token blacklisting for logout
- Refresh token mechanism

```javascript
// Example authentication header
Authorization: Bearer <your_jwt_token>
```

## 🔒 Security Features

- Password Hashing (bcrypt)
- JWT Token Authentication
- Rate Limiting
- XSS Protection
- NoSQL Injection Prevention
- CORS Configuration
- Security Headers (Helmet)
- Role-based Access Control
- Owner/Admin Permission System

## 📝 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/signup
Content-Type: application/json

{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/me
Authorization: Bearer <token>
Content-Type: application/json

{
    "fullName": "Updated Name",
    "biography": "Software developer passionate about web technologies",
    "skillSet": ["JavaScript", "Node.js", "MongoDB"],
    "userLocation": "New York"
}
```

### User Management Endpoints

#### Get All Users (Admin)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /api/users/:id
```

#### Get Own Profile
```http
GET /api/users/profile/me
Authorization: Bearer <token>
```

#### Update Own Profile
```http
PUT /api/users/profile/me
Authorization: Bearer <token>
Content-Type: application/json

{
    "fullName": "Updated Name",
    "emailAddress": "updated@example.com",
    "biography": "Software developer",
    "skillSet": ["JavaScript", "Node.js"]
}
```

#### Delete Own Account
```http
DELETE /api/users/profile/me
Authorization: Bearer <token>
```

#### Delete User (Owner or Admin)
```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

### Follow Management Endpoints

#### Follow a User
```http
POST /api/users/follow/:id
Authorization: Bearer <token>
```

#### Unfollow a User
```http
POST /api/users/unfollow/:id
Authorization: Bearer <token>
```

#### Get User's Followers
```http
GET /api/users/:id/followers
```

#### Get Users Being Followed by a User
```http
GET /api/users/:id/following
```

#### Check If Current User is Following Another User
```http
GET /api/users/:id/is-following
Authorization: Bearer <token>
```

### Post Management Endpoints

#### Create Post
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Post Title",
  "content": "This is a test post content",
  "tags": ["test", "example"]
}
```

#### Get All Posts
```http
GET /api/posts
```

#### Get Post by ID
```http
GET /api/posts/:postId
```

#### Update Post
```http
PUT /api/posts/:postId
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Post Title",
  "content": "Updated post content"
}
```

#### Delete Post
```http
DELETE /api/posts/:postId
Authorization: Bearer <token>
```

#### Like/Unlike a Post
```http
POST /api/posts/:postId/like
Authorization: Bearer <token>
```
Note: This endpoint acts as a toggle - it will add a like if not already liked, or remove the like if already liked.

#### Comment on a Post
```http
POST /api/posts/:postId/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a test comment"
}
```

#### Bookmark/Unbookmark a Post
```http
POST /api/posts/:postId/bookmark
Authorization: Bearer <token>
```
Note: This endpoint acts as a toggle - it will add a bookmark if not already bookmarked, or remove the bookmark if already bookmarked.

#### Get All Bookmarked Posts
```http
GET /api/posts/bookmarks
Authorization: Bearer <token>
```

## 🔍 Error Handling

### Error Response Format
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Success Response Format
```javascript
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

## 📊 Logging

### Log Levels
- ERROR: Application errors
- WARN: Warnings
- INFO: General information
- DEBUG: Debugging information

### Log Format
```javascript
[2023-12-25 10:30:45] [ERROR]: Error message
Stack: Error stack trace
```

## ⚙️ Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/community
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

## 🧪 Testing

```bash
# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 📱 Testing with Postman

### Prerequisites
- Make sure the server is running
- Set environment variables in Postman:
  - `BASE_URL`: http://localhost:5000
  - `TOKEN`: (will be filled after login)

### Authentication Tests

#### 1. Register a New User
- **Method**: POST
- **URL**: {{BASE_URL}}/api/auth/signup
- **Body (JSON)**:
```json
{
  "fullName": "Test User",
  "emailAddress": "test@example.com",
  "password": "Test@123"
}
```
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "fullName": "Test User",
    "emailAddress": "test@example.com",
    "userRole": "user",
    "_id": "..."
  }
}
```

#### 2. Login with the New User
- **Method**: POST
- **URL**: {{BASE_URL}}/api/auth/login
- **Body (JSON)**:
```json
{
  "emailAddress": "test@example.com",
  "password": "Test@123"
}
```
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "...",
    "fullName": "Test User",
    "emailAddress": "test@example.com"
  }
}
```
- **After Response**: Copy the token value and set it as `TOKEN` environment variable in Postman

### Follow Management Tests

#### 1. Follow a User
- **Method**: POST
- **URL**: {{BASE_URL}}/api/users/follow/:id (replace :id with target user ID)
- **Headers**:
  - Authorization: Bearer {{TOKEN}}
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully followed user",
  "data": {
    "followedUserId": "..."
  }
}
```

#### 2. Get User Followers
- **Method**: GET
- **URL**: {{BASE_URL}}/api/users/:id/followers (replace :id with user ID)
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "fullName": "Follower Name",
      "email": "follower@example.com",
      "profilePicture": "..."
    }
  ]
}
```

#### 3. Get User Following
- **Method**: GET
- **URL**: {{BASE_URL}}/api/users/:id/following (replace :id with user ID)
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "fullName": "Following User",
      "email": "following@example.com",
      "profilePicture": "..."
    }
  ]
}
```

#### 4. Check If Following a User
- **Method**: GET
- **URL**: {{BASE_URL}}/api/users/:id/is-following (replace :id with target user ID)
- **Headers**:
  - Authorization: Bearer {{TOKEN}}
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "isFollowing": true
}
```

#### 5. Unfollow a User
- **Method**: POST
- **URL**: {{BASE_URL}}/api/users/unfollow/:id (replace :id with target user ID)
- **Headers**:
  - Authorization: Bearer {{TOKEN}}
- **Expected Response** (200 OK):
```json
{
  "success": true,
  "message": "Successfully unfollowed user",
  "data": {
    "unfollowedUserId": "..."
  }
}
```

### Posts Tests

#### 1. Create a New Post
- **Method**: POST
- **URL**: {{BASE_URL}}/api/posts
- **Headers**:
  - Authorization: Bearer {{TOKEN}}
- **Body (JSON)**:
```json
{
  "title": "My First Post",
  "content": "This is the content of my first post!",
  "tags": ["test", "first"]
}
```
- **Expected Response** (201 Created):
```json
{
  "message": "Post created successfully",
  "post": {
    "title": "My First Post",
    "content": "This is the content of my first post!",
    "author": "...",
    "tags": ["test", "first"],
    "likes": [],
    "comments": [],
    "_id": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### 2. Get All Posts
- **Method**: GET
- **URL**: {{BASE_URL}}/api/posts
- **Expected Response** (200 OK):
```json
[
  {
    "_id": "...",
    "title": "My First Post",
    "content": "This is the content of my first post!",
    "author": {
      "_id": "...",
      "name": "Test User",
      "email": "test@example.com"
    },
    "tags": ["test", "first"],
    "likes": [],
    "comments": [],
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### 3. Get a Single Post by ID
- **Method**: GET
- **URL**: {{BASE_URL}}/api/posts/:postId (replace :postId with the actual post ID)
- **Expected Response** (200 OK):
```json
{
  "_id": "...",
  "title": "My First Post",
  "content": "This is the content of my first post!",
  "author": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com"
  },
  "tags": ["test", "first"],
  "likes": [],
  "comments": [],
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### 4. Update a Post
- **Method**: PUT
- **URL**: {{BASE_URL}}/api/posts/:postId (replace :postId with the actual post ID)
- **Headers**:
  - Authorization: Bearer {{TOKEN}}
- **Body (JSON)**:
```json
{
  "title": "Updated Post Title",
  "content": "This is the updated content of my post!",
  "tags": ["test", "updated"]
}
```
- **Expected Response** (200 OK):
```json
{
  "message": "Post updated",
  "post": {
    "_id": "...",
    "title": "Updated Post Title",
    "content": "This is the updated content of my post!",
    "tags": ["test", "updated"],
    "author": "...",
    "likes": [],
    "comments": []
  }
}
```

## 📱 Testing with Postman

1. **Setup**:
   - Install Postman: [https://www.postman.com/downloads/](https://www.postman.com/downloads/)
   - Create a new workspace or collection for "Community Platform API"

2. **Authentication Flow**:
   - Register a new user
   - Login to get a token
   - Use token in subsequent requests by adding header: `Authorization: Bearer YOUR_TOKEN`

3. **Testing Posts**:
   - Create a post and get the postId from the response
   - Get all posts to see your post in the list
   - Try updating, liking/unliking, bookmarking, and commenting on your post
   - Test permissions by attempting to modify posts you don't own

4. **Testing Follow System**:
   - Register two different users
   - Login as the first user and follow the second user
   - Check if the first user is in the second user's followers list
   - Check if the second user is in the first user's following list
   - Unfollow and verify the relationship is removed

5. **Example Postman Collection**:
   ```json
   {
     "info": {
       "_postman_id": "YOUR_COLLECTION_ID",
       "name": "Community API",
       "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
     },
     "item": [
       {
         "name": "Auth",
         "item": [
           {
             "name": "Register",
             "request": {
               "method": "POST",
               "header": [],
               "body": {
                 "mode": "raw",
                 "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Test@123\"\n}",
                 "options": {
                   "raw": {
                     "language": "json"
                   }
                 }
               },
               "url": {
                 "raw": "http://localhost:5000/api/auth/register",
                 "protocol": "http",
                 "host": ["localhost"],
                 "port": "5000",
                 "path": ["api", "auth", "register"]
               }
             }
           }
         ]
       },
       {
         "name": "Follow",
         "item": [
           {
             "name": "Follow User",
             "request": {
               "method": "POST",
               "header": [
                 {
                   "key": "Authorization",
                   "value": "Bearer {{TOKEN}}"
                 }
               ],
               "url": {
                 "raw": "http://localhost:5000/api/users/follow/:id",
                 "protocol": "http",
                 "host": ["localhost"],
                 "port": "5000",
                 "path": ["api", "users", "follow", ":id"],
                 "variable": [
                   {
                     "key": "id",
                     "value": "{{targetUserId}}"
                   }
                 ]
               }
             }
           }
         ]
       }
     ]
   }
   ```

## 🔄 API Rate Limits

- 100 requests per 15 minutes per IP
- Custom limits for specific routes:
  - Auth: 20 requests per 15 minutes
  - User creation: 5 requests per hour

## 🏗️ Development Guidelines

### Code Style
- ESLint configuration
- Prettier formatting
- JSDoc comments for functions
- Async/await for promises

### Git Workflow
1. Create feature branch
2. Implement changes
3. Write tests
4. Submit PR
5. Code review
6. Merge to main

## 📈 Performance Optimization

- Database indexing
- Response compression
- Cache implementation
- Query optimization

## 🐛 Debugging

```bash
# Start with debugging
npm run debug

# Debug specific file
node --inspect-brk src/index.js
```

## 📋 Maintenance

### Database Backup
```bash
# Backup MongoDB
npm run db:backup

# Restore MongoDB
npm run db:restore
```

### Log Rotation
- Daily rotation
- 30-day retention
- Compressed archives

## 📞 Support

- GitHub Issues
- Documentation Wiki
- Team Contact

## 📄 License
MIT License - See [LICENSE](LICENSE) for details

# Database Migration

If you encounter a duplicate key error with emailAddress field, run the following migration script: