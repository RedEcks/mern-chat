const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcryptjs');

dotenv.config();
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const bcryptSalt = bcrypt.genSaltSync(10)
const app = express();
app.use(express.json());
app.use(cookieParser())

// Setup CORS with client URL
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL, // Make sure this is set to 'http://localhost:3000'
}));

// Test endpoint to ensure server is running
app.get('/test', (req, res) => {
    res.json('its alive');
});

app.get('/profile', (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(403).json('Invalid token');
            }
            res.json(userData);
        });
    } else {
        res.status(401).json('No token provided');
    }
});

app.post('/login',async (req,res)=>{
    const {username, password} = req.body;
    const foundUser = await User.findOne({username});

})

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt)
        // Create a new user in the database
        const createdUser = await User.create({ 
            username: username, 
            password: hashedPassword });

        // Sign a JWT token for the new user
        jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Error generating token' });
            }

            // Set the token as a cookie and respond with user id
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                .status(201)
                .json({ id: createdUser._id, username });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
