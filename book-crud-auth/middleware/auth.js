const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT tokens
function authenticateJWT(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];  // Extract token from "Bearer <token>"

  if (token == null) {
    // Log error for debugging
    console.log('No token provided');
    return res.status(401).json({ message: 'No token provided' });  // Unauthorized if no token
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // Log error for debugging
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ message: 'Forbidden: Invalid token' });  // Forbidden if token invalid
    }
    
    // Attach user information to request
    req.user = user;
    next();  // Proceed to next middleware or route handler
  });
}

module.exports = { authenticateJWT };

