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


const Comment = mongoose.model('Comment', new mongoose.Schema({}, { collection: 'comments', strict: false }));

const user1 = new Comment();

// Test route
app.get('/', async (req, res) => {
    const firstComment = await Comment.findOne();
    res.send(`here is the 1st user ${firstComment.name}`)
});

// Start the server
app.listen(3000, () => {
    console.log(`Server is running`);
});
