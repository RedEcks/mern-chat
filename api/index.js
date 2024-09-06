const express = require('express');

const app =  express();

app.get('/test', (req,res) =>{
    res.json('its alive')
});


app.listen(4000);