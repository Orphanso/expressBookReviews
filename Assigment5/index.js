const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'your_session_secret',  // Replace with a secure secret
  resave: false,  // Avoid saving sessions on every request if they haven't changed
  saveUninitialized: false  // Avoid saving uninitialized sessions
}));

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token, 'your_secret_key', (err, user) => {  // Ensure this matches the secret used to sign tokens
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Apply JWT authentication middleware to all routes under '/customer/auth/'
app.use('/customer/auth/', authenticateJWT);

// Use customer routes
app.use('/customer', customer_routes);

// Use general routes
app.use('/', genl_routes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
