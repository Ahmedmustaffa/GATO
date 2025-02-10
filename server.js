const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const methodOverride = require('method-override');
const User = require('./models/user');
const Post = require('./models/post');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();


app.use(methodOverride('_method'));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use(express.static(path.join(__dirname, 'public')));


app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,  // Use your MongoDB Atlas connection string
    collectionName: 'sessions',
  }),
  cookie: {
    secure: false,
    httpOnly: true,
  },
}));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


//uploading images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.params.id;
    const userImageDir = path.join(__dirname, 'public', 'users', userId, 'images');
    if (!fs.existsSync(userImageDir)) fs.mkdirSync(userImageDir, { recursive: true });
    cb(null, userImageDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  },
});

// Initialize Multer
const upload = multer({ storage: storage });


// Connect to MongoDB
const uri = process.env.MONGO_URI;
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));
    
const isAuthenticated = (req, res, next) => {
  if (!req.session.user_id) {
    return res.render('login');
  }
  next();
};


// Test route
app.get(['/', '/home'], async (req, res) => {
  res.render('home');
});

app.get('/explore', async (req, res) => {
    res.render('explore');
});

app.get('/app', async (req, res) => {
    res.render('app');
});

app.get('/contact', async (req, res) => {
    res.render('contact');
});

app.get('/signup', async (req, res) => {
    res.render('signup');
});


app.post('/signup', async (req, res) => {
    try {
      let { username, firstName, lastName, email, phoneNumber, birthday, gender, password,profileImg } = req.body;
        
        username = "@" + username;
        profileImg = "http://localhost:3000/images/profile-2.jpg";
      // Create a new user
      const newUser = new User({
        username,
        firstName,
        lastName,
        email,
        phoneNumber,
        profileImg,
        birthday,
        gender,
        password, // Password will be hashed automatically by the pre-save hook
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Respond with the created user (excluding the password)
      const userResponse = { ...newUser.toObject() };
      delete userResponse.password; // Remove the password from the response
  
      res.status(201).json({ message: 'User created successfully', user: userResponse });
    } catch (error) {
      // Handle errors (e.g., duplicate username or email)
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Username, email, or phone number already exists' });
      }
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

app.get('/login', async (req, res) => {
    res.render('login');
});



app.post('/login', async (req, res) => {
    try {
      let { username, password } = req.body;
      username = "@" + username;
      // Find the user by email
      const user = await User.findOne({ username });
      if (user) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Invalid username or password' });
        } else {
          req.session.user_id = user._id;
        }
      }
      
      // Respond with a success message (or a token for authentication)
      res.redirect(`/profile`);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/profile', isAuthenticated, async (req, res) => {
  const user = await User.findById(req.session.user_id);
  if (!user) {
      return res.redirect('/login'); // Extra safety check
  }
  res.render('index', { user });
});



app.get('/feeds/new', isAuthenticated, async (req, res) => {
  res.render('new');
});


app.post('/feeds', isAuthenticated, upload.single('media'), async (req, res) => {
  try {
    const user = await User.findById(req.session.user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { caption } = req.body;
    const mediaUrl = `/users/${user._id}/images/${req.file.filename}`;

    const newPost = new Post({
      user: user._id,
      caption,
      media: [mediaUrl],
    });

    await newPost.save();
    user.posts.push(newPost._id);
    await user.save();

    res.redirect('/profile'); // Redirect to their profile
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


app.get('/feeds', async (req, res) => {
  const user = await User.findById(req.session.user_id).populate('posts');
  res.render('feeds', { user });
});


app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

  
app.use((req, res, ) => {
    res.render('404');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running`);
});
