/**
 * Middleware to handle JSON parsing issues safely
 * Specifically targets follow/unfollow routes
 */
exports.jsonBodySafeParser = (req, res, next) => {
  // Only need special handling for certain routes and methods
  const needsEmptyBodyHandling = 
    (req.method === 'POST' || req.method === 'PUT') && 
    (req.path.includes('/follow') || req.path.includes('/unfollow'));
    
  if (needsEmptyBodyHandling) {
    // Always ensure body is an object for these endpoints
    if (!req.body || typeof req.body !== 'object') {
      req.body = {};
      console.log(`[${req.method} ${req.path}] Empty body normalized`);
    }
  }
  
  next();
};

/**
 * Error handler for JSON parsing issues
 */
exports.jsonParsingErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const isFollowRoute = req.path.includes('/follow') || req.path.includes('/unfollow');
    console.error(`JSON parse error on ${req.path}: ${err.message}`);
    
    // Special handling for follow/unfollow routes
    if (isFollowRoute) {
      req.body = {};
      return next(); // Continue with empty body for these routes
    }
    
    // For other routes, send error response
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: err.message
    });
  }
  
  next(err); // Pass other errors along
};
