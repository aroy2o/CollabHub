const User = require("../models/user.model");

/**
 * Sanitizes and formats an email address
 * @param {string} email - The email to sanitize
 * @returns {string} - The sanitized email
 */
exports.sanitizeEmail = (email) => {
  if (!email) return '';
  return email.toLowerCase().trim();
};

/**
 * Checks if an email exists in the database (for backward compatibility)
 * Since we're now allowing duplicate emails, this always returns false
 * @param {string} email - The email to check
 * @returns {boolean} - Always returns false as we now allow duplicate emails
 */
exports.checkEmailExists = async (email) => {
  return false; // Always return false as we now allow duplicate emails
};

/**
 * Lists all emails in the database (for debugging)
 * @returns {Array} - Array of all emails
 */
exports.listAllEmails = async () => {
  try {
    const users = await User.find({}, 'email');
    return users.map(user => user.email);
  } catch (error) {
    console.error('Error listing emails:', error);
    return [];
  }
};
