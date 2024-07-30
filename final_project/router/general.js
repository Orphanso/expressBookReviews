const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.find(user => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 2));
});

public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});

public_users.get('/author/:author', function (req, res) {
  const authorName = req.params.author.trim();
  const booksByAuthor = [];

  for (const key in books) {
    if (books[key].author.toLowerCase() === authorName.toLowerCase()) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    res.status(200).json(booksByAuthor);
  } else {
    res.status(404).json({ message: "No books found by this author" });
  }
});

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.trim();
  const booksByTitle = [];

  for (const key in books) {
    if (books[key].title.toLowerCase() === title.toLowerCase()) {
      booksByTitle.push(books[key]);
    }
  }

  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: "No books found with this title" });
  }
});

public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    res.status(200).json({ reviews: book.reviews });
  } else {
    res.status(404).json({ message: "Book not found" });
  }
});


function getBooksByAuthor(author) {
  axios.get(`http://localhost:5000/author/${author}`)
    .then(response => {
      console.log('Books by author:', response.data);
    })
    .catch(error => {
      console.error('Error fetching books by author:', error);
    });
}


async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    console.log('Books by author:', response.data);
  } catch (error) {
    console.error('Error fetching books by author:', error);
  }
}


function getBooksByTitle(title) {
  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      console.log('Books by title:', response.data);
    })
    .catch(error => {
      console.error('Error fetching books by title:', error);
    });
}


async function getBooksByTitle(title) {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    console.log('Books by title:', response.data);
  } catch (error) {
    console.error('Error fetching books by title:', error);
  }
}


getBooksByAuthor('Chinua Achebe');
getBooksByTitle('Things Fall Apart');

module.exports.general = public_users;
