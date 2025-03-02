require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const logger = require("./src/utils/logger");
const { errorHandler, jsonErrorHandler } = require("./src/middleware/error.middleware");
const { jsonBodySafeParser, jsonParsingErrorHandler } = require('./src/middleware/jsonBodyHandler.middleware');

// Import Routes
const authRoutes = require("./src/routes/auth.routes");
const userRoutes = require("./src/routes/user.routes");
const postRoutes = require("./src/routes/post.routes");
const profilePictureRoutes = require("./src/routes/profilePicture.routes");

// Import the new middleware
const { handleEmptyBody } = require("./src/middleware/bodyParser.middleware");

// Initialize Express App
const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CORS Configuration - Fix CORS to allow credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(cors()); // Enable CORS
app.use(helmet()); // Secure HTTP headers

// Parsing middleware - optimized order
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    // No need to pre-parse here, just pass along for proper error handling
  }
})); 
app.use(express.urlencoded({ extended: true }));

// Apply specialized JSON handling middleware
app.use(jsonParsingErrorHandler);  // First catch any JSON parsing errors
app.use(jsonBodySafeParser);       // Then ensure follow routes always have a body

app.use(morgan("dev")); // HTTP request logger
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));

// Single unified middleware for follow routes
app.use((req, res, next) => {
  if ((req.path.includes('/follow/') || req.path.includes('/unfollow/')) && req.method === 'POST') {
    // Always ensure there's a body object
    req.body = req.body || {};
    console.log(`Follow/unfollow request: ${req.method} ${req.path} - Body set to:`, req.body);
  }
  next();
});

// Add our empty body handler here, before routes
app.use(handleEmptyBody);

// Add debugging middleware for request body
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.path.includes('/auth/signup')) {
    console.log('Request body middleware:', {
      contentType: req.headers['content-type'],
      bodyKeys: Object.keys(req.body),
      bodyEmpty: Object.keys(req.body).length === 0,
      body: req.body
    });
  }
  next();
});

// Add this before your route handlers
app.use((req, res, next) => {
  if (req.path.includes('/auth/signup') || req.path.includes('/auth/login')) {
    console.log('Auth request received:');
    console.log('- Headers:', req.headers);
    console.log('- Body:', req.body);
    console.log('- Content-Type:', req.headers['content-type']);
    console.log('- Content-Length:', req.headers['content-length']);
  }
  next();
});

// Error handling middleware for JSON parsing errors
app.use(jsonErrorHandler);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/profile-picture", profilePictureRoutes);

// Add simple status endpoint for health checks
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Enhance error logging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1); // It's generally recommended to exit the process after an uncaught exception
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/community__platform";

// Make sure mongoose connects correctly with error handling
mongoose
  .connect(MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
  })
  .then(() => {
    logger.info("🚀 MongoDB Connected Successfully!");
    app.listen(PORT, () => {
      logger.info(`⚡ Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`❌ Database Connection Error: ${error.message}`);
    process.exit(1);
  });

// Root Route
app.get("/", (req, res) => {
  res.send("🌟 Welcome to the Community Collaboration API!");
});
