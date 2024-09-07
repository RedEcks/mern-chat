const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const User = require('./models/user')

dotenv.config();
mongoose.connect(process.env.MONGO_URL)

console.log(process.env.MONGO_URL)
const app =  express();

app.get('/test', (req,res) =>{
    res.json('its alive')
});

app.post('/register',async(req,res)=>{
    const {username,password} = req.body;
    const createdUser = await User.create({username,password})
    jwt.sign({userId:createdUser._id}, )
})


app.listen(4000);


