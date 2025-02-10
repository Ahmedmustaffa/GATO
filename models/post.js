const mongoose = require("mongoose");
const moment = require("moment");

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    media: [{
      type: String, // URLs for images
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    }],
    is_edited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


// Virtual for comments count

postSchema.virtual('comments_count').get(function () {
  return this.comments.length;
});


// Virtual for likes count
postSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

// Virtual for comments count
postSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

postSchema.virtual('relativeTime').get(function () {
  console.log('Created At:', this.createdAt); // Debug created_at
  console.log('Current Time:', new Date()); // Debug current time
  return moment.utc(this.createdAt).fromNow(); // Calculate relative time
});
// Ensure virtuals are included when converting to JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
