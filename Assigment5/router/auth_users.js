const express = require('express');
const jwt = require('jsonwebtoken');
let books = require('./booksdb.js'); // Import the book list
const regd_users = express.Router();

let users = []; // Array to store registered users
const JWT_SECRET = 'your_secret_key'; // Replace with a strong secret key

// User registration
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (users.find(user => user.username === username)) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // Add new user to the users array
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// User login
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

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from the Authorization header
  const { review } = req.query; // Retrieve the review from the query parameters
  const { isbn } = req.params; // Retrieve ISBN from request parameters

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the JWT token
    const username = decoded.username; // Get the username from the decoded token

    // Check if review is provided
    if (!review) {
      return res.status(400).json({ message: "Review is required" });
    }

    // Find the book by ISBN
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews if not present
    if (!book.reviews) {
      book.reviews = {};
    }

    // Add or update the review for the book
    book.reviews[username] = review;

    return res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]; // Extract the token from Authorization header
  const { isbn } = req.params; // Retrieve ISBN from request parameters

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify the JWT token
    const username = decoded.username;

    // Find the book by ISBN
    const book = books[isbn];

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has a review for this book
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username]; // Delete the user's review

      return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports.authenticated = regd_users;
module.exports.users = users;
