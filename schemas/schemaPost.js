const mongoose = require("mongoose");
const postSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      default: [],
    },
    comments: [
      {
        commentedBy: { type: mongoose.Schema.Types.ObjectId },
        comment: { type: String },
      },
    ],
  },
  { timestamps: true }
);
const Post = mongoose.model("Posts", postSchema);
module.exports = Post;
