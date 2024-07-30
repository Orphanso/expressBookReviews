const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(session({
  secret: 'your_session_secret',
  resave: true,
  saveUninitialized: true
}));

const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    jwt.verify(token, 'your_secret_key', (err, user) => {
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

app.use('/customer/auth/*', authenticateJWT);

app.use('/customer', customer_routes);
app.use('/', genl_routes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
