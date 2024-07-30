const express = require('express');
const Book = require('../models/Book');
const { authenticateJWT } = require('../middleware/auth');
const router = express.Router();

// Add a review
router.post('/:bookId/reviews', authenticateJWT, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = { userId: req.user.id, review: req.body.review };
    book.reviews.push(review);
    await book.save();

    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Modify a review
router.put('/:bookId/reviews/:reviewId', authenticateJWT, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = book.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    review.review = req.body.review;
    await book.save();

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a review
router.delete('/:bookId/reviews/:reviewId', authenticateJWT, async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const review = book.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    review.remove();
    await book.save();

    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
