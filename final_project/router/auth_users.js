const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const JWT_SECRET = 'your_secret_key';

regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { review } = req.query;
  const { isbn } = req.params;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;

    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = {};
    }

    book.reviews[username] = review;

    return res.status(200).json({
      message: "Review added/updated successfully",
      reviews: book.reviews
    });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { isbn } = req.params;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded.username;

  
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

  
    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({ message: "Review not found or does not belong to user" });
    }

  
    delete book.reviews[username];

    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
