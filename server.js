require('dotenv').config();
const express = require('express');
const bodyParser =require('body-parser');
const authRoutes = require('./auth');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const app = express()
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));
const PORT = process.env.PORT;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

function requireLogin(req,res,next) {
    if(req.session && req.session.email) {
        next();

    }else {
        res.redirect('/login.html');
    }
}
app.get('/product.html', requireLogin, (req, res) =>{
    res.sendFile(path.join(__dirname, 'public', 'product.html'));
})
app.use('/api/auth',authRoutes);
app.get('/',(req,res) =>{
   res.sendFile(path.join(__dirname, 'public','register.html'));
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public','login.html'));
    
});

app.get('/api/email/', (req,res) =>{
      console.log("Session object:", req.session);
    if(req.session.email) {
        res.json({email: req.session.email});

    }else{
        res.status(401).json({error:'Not logged in'})
    }
})
app.listen(PORT, () =>{
    console.log(`Server running on ${PORT}`);

});
