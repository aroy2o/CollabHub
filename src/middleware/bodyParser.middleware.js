/**
 * Middleware to handle empty request bodies
 */
exports.handleEmptyBody = (req, res, next) => {
  // For POST and PUT requests, ensure body exists
  if ((req.method === 'POST' || req.method === 'PUT') && !req.body) {
    req.body = {};
  }
  next();
};

/**
 * Middleware to handle JSON parsing errors
 */
exports.handleJsonErrors = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    
    // For follow/unfollow routes, continue with empty body
    if (req.path.includes('/follow/') || req.path.includes('/unfollow/')) {
      req.body = {};
      return next();
    }
    
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload',
      error: err.message
    });
  }
  next(err);
};
