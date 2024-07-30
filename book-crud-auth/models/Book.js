const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  review: String,
});

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  isbn: String,
  reviews: [reviewSchema],
});

module.exports = mongoose.model('Book', bookSchema);
