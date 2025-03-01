const crypto = require("crypto");

/**
 * Formats a success response
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @returns {Object} - Formatted response object
 */
const successResponse = (statusCode, message, data = {}) => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

/**
 * Formats an error response
 * @param {number} statusCode - HTTP status code
 * @param {string} errorMessage - Error message
 * @returns {Object} - Formatted error response
 */
const errorResponse = (statusCode, errorMessage) => {
  return {
    success: false,
    statusCode,
    error: errorMessage,
  };
};

/**
 * Generates a random unique identifier
 * @param {number} length - Length of the unique ID
 * @returns {string} - Unique identifier
 */
const generateUniqueId = (length = 16) => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Validates an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, otherwise false
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a string is a strong password
 * @param {string} password - Password to validate
 * @returns {boolean} - True if strong, otherwise false
 */
const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[@$!%*?&]/.test(password)
  );
};

/**
 * Formats date into a readable string (DD-MM-YYYY HH:mm:ss)
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date string
 */
const formatDate = (date) => {
  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Capitalizes the first letter of a string
 * @param {string} text - Input text
 * @returns {string} - Capitalized text
 */
const capitalizeFirstLetter = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
};

module.exports = {
  successResponse,
  errorResponse,
  generateUniqueId,
  isValidEmail,
  isStrongPassword,
  formatDate,
  capitalizeFirstLetter,
};
