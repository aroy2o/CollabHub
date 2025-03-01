/**
 * Special middleware to handle empty request bodies for specific routes like follow/unfollow
 * that don't require request bodies but are sent with content-type: application/json
 */
exports.handleEmptyBody = (req, res, next) => {
  // Convert path to lowercase for case-insensitive matching
  const path = req.path.toLowerCase();
  
  // Check if this is a follow-related request
  const isFollowRequest = path.includes('/follow/') || path.includes('/unfollow/');
  
  // Debug logging
  console.log(`Request path: ${req.path}, Method: ${req.method}, ContentType: ${req.headers['content-type']}`);
  console.log(`Is follow request: ${isFollowRequest}, Body keys: ${Object.keys(req.body || {}).length}`);
  
  // Force empty object for follow routes regardless of content-type
  if (isFollowRequest && req.method === 'POST') {
    // Always provide a defined body object for follow/unfollow routes
    req.body = req.body || {};
    console.log('Empty body handler applied');
  }
  
  next();
};
