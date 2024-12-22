const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json()); // Middleware for parsing JSON requests

// Connect to MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('Error connecting to MongoDB:', err));


// Test route
app.get('/', (req, res) => {
    res.send('Welcome to the ASD Social Website!');
});

// Start the server
app.listen(3000, () => {
    console.log(`Server is running`);
});
