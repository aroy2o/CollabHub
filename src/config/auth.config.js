module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || "super_secret_key", // Fallback for development
    JWT_EXPIRES_IN: "7d", // Token expiration (7 days)
    BCRYPT_SALT_ROUNDS: 10, // Number of salt rounds for password hashing
  };
  