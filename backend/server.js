const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-boilerplate';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

// Test route
app.get('/api/message', (req, res) => {
  res.json({ message: 'Hello from MERN backend!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
