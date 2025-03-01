const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../config/auth.config");

/**
 * Hashes a user's password before storing it in the database.
 * @param {string} password - The plain text password.
 * @returns {string} - The hashed password.
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Generates a JSON Web Token (JWT) for authentication.
 * @param {string} userId - The user's ID.
 * @returns {string} - The generated JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Registers a new user.
 * @param {Object} userData - The user's registration details.
 * @returns {Object} - The created user object with a token.
 */
const registerUser = async (userData) => {
  const { fullName, email, password } = userData;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password before saving
  const hashedPassword = await hashPassword(password);
  const newUser = new User({ fullName, email, password });

  await newUser.save();

  return {
    user: newUser,
    token: generateToken(newUser._id),
  };
};

/**
 * Logs in a user by verifying credentials.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Object} - The logged-in user object with a token.
 */
const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    user,
    token: generateToken(user._id),
  };
};

module.exports = {
  registerUser,
  loginUser,
  hashPassword,
  generateToken,
};
