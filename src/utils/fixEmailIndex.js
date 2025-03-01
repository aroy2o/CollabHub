const mongoose = require('mongoose');
const User = require('../models/user.model');
const dotenv = require('dotenv');
const logger = require('./logger');

dotenv.config();

async function fixEmailIndex() {
  let connection;
  try {
    logger.info('Connecting to MongoDB...');
    connection = await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB successfully');

    // Drop the existing index on email
    logger.info('Dropping existing email index...');
    try {
      await User.collection.dropIndex('email_1');
      logger.info('Existing email index dropped');
    } catch (err) {
      if (err.code !== 27) { // 27 is the error code for index not found
        throw err;
      }
      logger.warn('No existing email index found');
    }

    // Create a new index with collation for case insensitivity
    logger.info('Creating new case-insensitive email index...');
    await User.collection.createIndex(
      { email: 1 },
      { 
        unique: true,
        collation: { locale: 'en', strength: 2 },
        background: true,
        name: 'email_1_ci' // giving explicit name to the index
      }
    );
    logger.info('New case-insensitive email index created');
    
    const users = await User.find().select('email');
    logger.info(`Total users in database: ${users.length}`);
    
    // Check for duplicates using Set for better performance
    const emails = new Set();
    const duplicates = new Set();
    
    users.forEach(user => {
      const email = user.email?.toLowerCase();
      if (!email) {
        logger.warn(`User ${user._id} has no email`);
        return;
      }
      if (emails.has(email)) {
        duplicates.add(email);
      }
      emails.add(email);
    });
    
    if (duplicates.size > 0) {
      logger.warn(`Found ${duplicates.size} duplicate emails: ${[...duplicates].join(', ')}`);
    } else {
      logger.info('No duplicate emails found');
    }

    logger.info('Email index repair completed');
  } catch (error) {
    logger.error(`Error fixing email index: ${error.message}`);
    throw error;
  } finally {
    if (connection) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  }
}

// Run the function
fixEmailIndex()
  .catch(error => {
    logger.error('Script failed:', error);
    process.exit(1);
  });
