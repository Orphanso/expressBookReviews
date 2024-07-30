const express = require('express');
const Book = require('../models/Book');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Retrieve all books
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search books
router.get('/search', authenticateJWT, async (req, res) => {
  const { isbn, author, title } = req.query;

  try {
    const query = {};
    if (isbn) query.isbn = isbn;
    if (author) query.author = new RegExp(author, 'i');
    if (title) query.title = new RegExp(title, 'i');

    const books = await Book.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
