require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
const bookRoutes = require('./routes/books');
const reviewRoutes = require('./routes/reviews');
const { authenticateJWT } = require('./middleware/auth');

const mongoURI = process.env.MONGO_URI;
const sessionSecret = process.env.SESSION_SECRET;
const jwtSecret = process.env.JWT_SECRET;

// Debug environment variables
if (!mongoURI || !sessionSecret || !jwtSecret) {
  console.error('Missing environment variables');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
}));

app.use('/books', bookRoutes);
app.use('/reviews', reviewRoutes);

mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, username: user.username }, jwtSecret);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
