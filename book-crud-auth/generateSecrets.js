const crypto = require('crypto');

// Function to generate a random secret
const generateSecret = () => crypto.randomBytes(32).toString('hex');

// Generate and print the secrets
console.log('SESSION_SECRET:', generateSecret());
console.log('JWT_SECRET:', generateSecret());
