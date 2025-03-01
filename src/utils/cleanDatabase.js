const mongoose = require('mongoose');
const User = require('../models/user.model');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Utility script to find potential email duplication issues
 * To run: node src/utils/cleanDatabase.js
 */

async function checkDuplicateEmails() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find({}).select('_id email');
    
    console.log(`Total users found: ${users.length}`);
    
    // Create a normalized email map
    const emailMap = {};
    const duplicates = [];
    
    // Track all emails, normalizing case
    users.forEach(user => {
      const normalizedEmail = user.email.toLowerCase().trim();
      
      if (!emailMap[normalizedEmail]) {
        emailMap[normalizedEmail] = [user._id];
      } else {
        emailMap[normalizedEmail].push(user._id);
        duplicates.push(normalizedEmail);
      }
    });
    
    // Report duplicate emails
    if (duplicates.length) {
      console.log(`Found ${duplicates.length} duplicate emails:`);
      
      for (const email of duplicates) {
        console.log(`Email: ${email}, User IDs: ${emailMap[email].join(', ')}`);
      }
      
      console.log('\nTo fix this issue, you should keep only one user per email.');
    } else {
      console.log('No duplicate emails found.');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkDuplicateEmails();
