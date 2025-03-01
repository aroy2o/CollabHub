const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    logger.error('Error 🔥', { error: err, stack: err.stack });
    
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // Production error handling
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }

  // Programming or unknown errors
  logger.error('ERROR 🔥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

/**
 * Express middleware to handle JSON parsing errors
 */
exports.jsonParseErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid JSON payload', 
      error: err.message 
    });
  }
  
  next(err);
};

/**
 * Express middleware to handle empty request bodies
 */
exports.emptyBodyHandler = (req, res, next) => {
  if (req.method === 'POST' && req.headers['content-type']?.includes('application/json') && !Object.keys(req.body).length) {
    req.body = {};  // Explicitly set to empty object to avoid parsing issues
  }
  
  next();
};

module.exports = {
  AppError,
  errorHandler
};
