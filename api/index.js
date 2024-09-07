const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const cors = require('cors')

dotenv.config();
mongoose.connect(process.env.MONGO_URL)

console.log(process.env.MONGO_URL)
const app =  express();
app.use(express.json());

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
}))

app.get('/test', (req,res) =>{
    res.json('its alive')
});

app.post('/register',async(req,res)=>{
    const {username,password} = req.body;
    try{
        const createdUser = await User.create({username,password})
        jwt.sign({userId:createdUser._id}, process.env.JWT_SECRET,{}, (err, token) =>{
            if (err) throw err;
            res.cookie('token', token).status(201).json({
                id: createdUser._id,
            })
        })
    } catch(err){
        if (err) throw err;
        res.status(500).json('error')
    }
    })
    



app.listen(4000);


