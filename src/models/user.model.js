const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/auth.config");

// Default profile picture as data URI (SVG)
const DEFAULT_PROFILE_IMAGE = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      // required: [true, "Username is required"], // Remove username requirement
      trim: true,
      unique: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot be more than 30 characters"],
      match: [/^[a-zA-Z0-9_\-.]+$/, "Invalid username format"],
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"]
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      trim: true,
      lowercase: true,
      sparse: true, // Prevents duplicate key errors for null values
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
      validate: {
        validator: function (v) {
          return v && v.trim() !== "";
        },
        message: "Email cannot be empty"
      }
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false
    },
    profilePicture: {
      type: String,
      default: DEFAULT_PROFILE_IMAGE,
    },
    profilePictureId: {
      type: String,
      default: null, // Will store Cloudinary's public_id for image management
    },
    biography: {
      type: String,
      maxlength: 250,
    },
    skillSet: {
      type: [String],
      default: [],
    },
    userLocation: {
      type: String,
      default: "",
    },
    userRole: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      }
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active'
    },
    bookmarks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      }
    ]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Pre-save hook to ensure email is valid and hash the password
UserSchema.pre("save", async function (next) {
  try {
    // Ensure email is not null or empty
    if (!this.email) {
      throw new Error("Email is required and cannot be null");
    }

    // Convert email to lowercase and trim spaces
    this.email = this.email.toLowerCase().trim();

    // Hash password if modified
    if (this.isModified("password")) {
      const salt = await bcrypt.genSalt(config.BCRYPT_SALT_ROUNDS);
      this.password = await bcrypt.hash(this.password, salt);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to generate password reset token
UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Generate JWT Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign({ id: this._id, role: this.userRole }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

// Compare hashed passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual fields for follower/following counts
UserSchema.virtual("followerCount").get(function () {
  return this.followers && Array.isArray(this.followers) ? this.followers.length : 0;
});
UserSchema.virtual("followingCount").get(function () {
  return this.following && Array.isArray(this.following) ? this.following.length : 0;
});
UserSchema.virtual("bookmarkCount").get(function () {
  return this.bookmarks && Array.isArray(this.bookmarks) ? this.bookmarks.length : 0;
});

// Remove existing unique index on email if it exists
async function removeDuplicateEmailIndex() {
  try {
    const User = mongoose.model("User", UserSchema);
    await User.collection.dropIndex("emailAddress_1").catch(err => console.log("Index not found or already removed"));
  } catch (error) {
    console.error("Error removing duplicate email index:", error);
  }
}
removeDuplicateEmailIndex();

// Initialize arrays for safe access during document creation
UserSchema.pre('init', function() {
  if (!this.bookmarks) this.bookmarks = [];
  if (!this.followers) this.followers = [];
  if (!this.following) this.following = [];
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
