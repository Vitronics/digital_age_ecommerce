require('dotenv').config();

const express = require('express');
const bcrypt = require('bcrypt');
const db = require ('./db');
const session = require('express-session');
require('crypto').randomBytes(64).toString('hex')
const app = express();


const router = express.Router();
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized:true,
    cookie:{secure: false}

}));
//register a user

router.post('/register', async(req, res) => {
    const {firstName,lastName, email, password}= req.body;
    if(!firstName ||!lastName ||!email ||!password){
        return res.status(400).send('All fields required!')
    }
    try{
        const checkEmail = 'SELECT * FROM users WHERE email = ?';
        db.query(checkEmail, [email],async (err, results)=>{
            if(err) return res.status(500).send('server error');
            if(results.length > 0){
                return res.redirect('/register.html?exists=true');
            }; 

        })
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users(first_name,last_name,email,password) VALUES (?,?,?,?)';
        db.query (query, [firstName,lastName,email,hashedPassword],(err,result) =>{
            if (err) throw err;
            res.redirect('/register.html?registered=true');

           
        })

      
    }  catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).send("Email already registered.");
    }
    console.error("Registration error:", error);
    res.status(500).send("Server error");
  }
    
});

//Login route

router.post('/login', (req , res) => {
const {email,password} =req.body;
if(!email || !password){
    return res.status(400).send('Email and password cannot be empty')
}
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query,[email], async (err, results) => {
    if(err) throw err;
    if (results.length > 0){
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch){
            req.session.email = user.username || user.name || user.email;
             console.log("✅ Logged in:", req.session.email);

             res.redirect('/login.html?loggedIn=true');
            // res.redirect('/product.html');

        }else{
           res.redirect('/login.html?error=invalid');
        }
    } else{
         res.redirect('/login.html?unknown=notFound');

        }
});
});
// Logout route

router.get('/logout' ,(req, res) =>{
    req.session.destroy((err) =>{
        if(err){
            console.error('logout error:', err);
            return res.status(500).send('Could not logout');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login.html');
    });
});
module.exports = router;