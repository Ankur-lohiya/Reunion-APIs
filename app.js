// Module exports
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require("dotenv").config();
const jwt = require("jsonwebtoken");

// Mongoose and database Connections
const mongoose = require("mongoose");
mongoose.set("strictQuery", true);
const User = require("./schemas/schemaUser");
const Posts = require("./schemas/schemaPost");
const Post = require("./schemas/schemaPost");
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// jwtauth middleware function
let jwtauth = function (req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    // console.log(token);
    const tokenCheck = jwt.verify(token, process.env.SECRET_KEY);
    // console.log(tokenCheck);
    req.body.userId = tokenCheck._id;
    next();
  } catch (err) {
    res.status(401).send({
      message: "You are not authenticated",
      data: err,
      success: false,
    });
  }
};

//get homepage
app.get("/", (req, res) => {
  res.render("Home Page");
});
// Register user route
app.post("/api/register", async (req, res) => {
  try {
    console.log(req.body);
    const UserExists = await User.findOne({ email: req.body.email });
    if (UserExists) {
      return res.status(200).send({
        message: "User already exists",
        success: false,
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;
    // create user
    const user = new User(req.body);
    await user.save();
    res.send({
      message: "User created successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

// Login and authenticate user route
app.post("/api/authenticate", async (req, res) => {
  try {
    //check user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({
        message: "User does not exists",
        success: false,
      });
    }
    //check password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.status(200).send({
        message: "Invalid password",
        success: false,
      });
    }
    //create and assign token
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "7h",
    });
    authToken = "Bearer " + token;
    res.setHeader("Authorization", authToken);
    res.send({
      message: "User logged in successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//follow route
app.post("/api/follow/:id", jwtauth, async (req, res) => {
  try {
    // console.log(req.params.id);
    // console.log(req.body.userId);
    const user = await User.findById(req.body.userId);
    const user1 = await User.findById(req.params.id);
    userExists = user.following.filter((follow) => {
      return follow._id == req.params.id;
    });
    console.log("this is line 124", userExists);
    if (userExists.length !== 0)
      return res.status(200).send({
        message: "User already followed",
        success: false,
        data: user,
        data1: user1,
      });

    user.following.push(user1._id);
    user1.followers.push(user._id);
    await user.save();
    await user1.save();
    res.send({
      message: "Following completed successfully",
      success: true,
      data: user,
      data1: user1,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//unfollow route
app.post("/api/unfollow/:id", jwtauth, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    const user1 = await User.findById(req.params.id);
    userExists = user.following.filter((follow) => {
      return follow._id == req.params.id;
    });
    console.log("line 156", userExists);
    if (userExists.length === 0)
      return res.status(200).send({
        message: "User does not follow",
        success: false,
        data: user,
        data1: user1,
      });
    user.following = user.following.filter((follow) => {
      return follow._id != req.params.id;
    });
    user1.followers = user1.followers.filter((follower) => {
      return follower._id != req.body.userId;
    });
    console.log("line 167", user.following);
    console.log("line 168", user1.followers);
    await user1.save();
    await user.save();
    res.send({
      message: "Unfollowing completed successfully",
      success: true,
      data: user,
      data1: user1,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//get user info route
app.get("/api/user", jwtauth, async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    res.send({
      message: "User info fetched successfully",
      success: true,
      username: user.email,
      followers: user.followers.length,
      following: user.following.length,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//add post route
app.post("/api/posts", jwtauth, async (req, res) => {
  try {
    const post = new Posts({
      createdBy: req.body.userId,
      title: req.body.title,
      description: req.body.description,
    });
    await post.save();
    const user = await User.findById(req.body.userId);
    user.posts.push(post._id);
    await user.save();
    res.send({
      message: "Post added successfully",
      success: true,
      post: post,
      post_id: post._id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt.toUTCString(),
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//delete post route
app.delete("/api/posts/:id", jwtauth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userId != post.createdBy) {
      res.send({
        message: "Does not have the correct access",
        creaetedBy: post.createdBy,
        deletingBy: req.body.userId,
        success: false,
      });
    }
    const user = await User.findById(post.createdBy);
    user.posts = user.posts.filter((post1) => {
      return !post1._id.equals(post._id);
    });
    await user.save();
    await Post.deleteOne({ _id: post._id });
    res.send({
      message: "Post deleted successfully",
      success: true,
      user: user,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//like post route
app.post("/api/like/:id", jwtauth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const user = await User.findById(req.body.userId);
    userExists = post.likes.filter((like) => {
      return like._id == req.body.userId;
    });
    if (userExists.length != 0) {
      return res.send({
        message: "User already liked",
        success: false,
        data: user,
        post: post,
      });
    }
    post.likes.push(user._id);
    await post.save();
    res.send({
      message: "Like completed successfully",
      success: true,
      post: post,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//unlike post route
app.post("/api/unlike/:id", jwtauth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    userExists = post.likes.filter((like) => {
      return like._id == req.body.userId;
    });
    if (userExists.length == 0) {
      return res.send({
        message: "User already unliked",
        success: false,
        post: post,
      });
    }
    post.likes = post.likes.filter((like) => {
      return like._id != req.body.userId;
    });
    await post.save();
    res.send({
      message: "Unlike completed successfully",
      success: true,
      post: post,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//comment post route
app.post("/api/comment/:id", jwtauth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({
      comment: req.body.comment,
      commentedBy: req.body.userId,
    });
    await post.save();
    res.send({
      message: "Comment completed successfully",
      success: true,
      post: post,
      comment: post.comments[post.comments.length - 1].comment,
      ID: post.comments[post.comments.length - 1].commentedBy,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

//get post by id
app.get("/api/posts/:id", jwtauth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    res.send({
      message: "Post fetched successfully",
      success: true,
      post: post,
      likes: post.likes.length,
      comments: post.comments.length,
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
      data: err,
      success: false,
    });
  }
});

app.get("/api/all_posts", jwtauth, async (req, res) => {
  const posts = await Posts.find({ createdBy: req.body.userId }).sort({
    createdAt: -1,
  });
  console.log(posts.length);
  post1 = [];
  posts.map((post) => {
    comments = [];
    post.comments.map((comment) => {
      comments.push({
        comment: comment.comment,
        commentedBy: comment.commentedBy,
      });
    });
    post1.push({
      post_id: post._id,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt.toUTCString(),
      comments: comments,
      likes: post.likes.length,
    });
  });
  res.send({
    message: "All post by user",
    posts: post1,
    countPost: post1.length,
  });
});

const port = process.env.PORT || 5000;
app.listen(5000, () => {
  console.log(`Server is running on port ${port}`);
});
