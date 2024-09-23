const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const ws = require('ws')

dotenv.config();
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
const bcryptSalt = bcrypt.genSaltSync(10);
const app = express();
app.use(express.json());
app.use(cookieParser());

// Setup CORS with client URL
app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL, // Ensure this is 'http://localhost:3000' for your frontend
}));

// Test endpoint to ensure server is running
app.get('/test', (req, res) => {
    res.json('its alive');
});

// Profile endpoint to verify token and retrieve user data
app.get('/profile', async (req, res) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, {}, async (err, userData) => {
            if (err) {
                console.error('JWT verification error:', err);
                return res.status(403).json('Invalid token');
            }
            
            try {
                // Query the database to find the user by the userId in the token
                const foundUser = await User.findById(userData.userId);
                if (!foundUser) {
                    return res.status(404).json('User not found');
                }

                // Return the user's data (excluding sensitive fields like password)
                res.json({ userId: foundUser._id, username: foundUser.username });
            } catch (error) {
                console.error('Error fetching user data:', error);
                res.status(500).json('Error fetching user data');
            }
        });
    } else {
        res.status(401).json('No token provided');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findOne({ username });
    if (foundUser) {
        const passOK = bcrypt.compareSync(password, foundUser.password);
        if (passOK) {
            // Sign JWT and send as a cookie
            jwt.sign({ userId: foundUser._id }, process.env.JWT_SECRET, {}, (err, token) => {
                if (err) {
                    console.error('JWT signing error:', err);
                    return res.status(500).json({ message: 'Error generating token' });
                }

                // Set the token in the cookie and send response with user ID
                res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                    .status(200)
                    .json({ id: foundUser._id });
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } else {
        res.status(401).json({ message: 'User not found' });
    }
});

// Register endpoint
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        // Create a new user in the database
        const createdUser = await User.create({ 
            username: username, 
            password: hashedPassword 
        });

        // Sign a JWT token for the new user
        jwt.sign({ userId: createdUser._id }, process.env.JWT_SECRET, {}, (err, token) => {
            if (err) {
                console.error('JWT signing error:', err);
                return res.status(500).json({ message: 'Error generating token' });
            }

            // Set the token as a cookie and respond with user ID and username
            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })
                .status(201)
                .json({ id: createdUser._id, username });
        });
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

const server = app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});

const wss = new ws.WebSocketServer({server})

wss.on('connection', (connection, req) =>{
   const cookies = req.headers.cookie;
   if(cookies){
    const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='))
    if(tokenCookieString){
        const token = tokenCookieString.split('=')[1];
        if(token){
            jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData)=>{
                if(err) throw err;
                const {userId, username} = userData;
                connection.userId = userId;
                connection.username = username;
            })
        }
    }
   }
   [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
        online: [...wss.clients].map(c =>({userId:c.userId, username:c.username}))
    }
        
    ))
   })
})
