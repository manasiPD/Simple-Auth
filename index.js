const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb+srv://mansi:1234admin@cluster0.4airyd9.mongodb.net/basicAuth?retryWrites=true&w=majority')
.then(() => {
    console.log("Mongo Connection Open!!");
})
.catch(err => {
    console.log("Oh no Mongo Connection Error!!");
    console.log(err);
})

app.set('view engine', 'ejs');
app.set('views', 'views');

// access to req.body (parsing the req.body)
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }));

// this is a middleware function which checks if there isn't any session
// the user will stay on the login page and then the next function will be called
const requireLogin = (req, res, next) => {
    if(!req.session.user_id){
        return res.redirect('/login');
    }
    next();
}

app.get('/', (req, res) => {
    res.send('Home page');
})

// to get the ejs templete
app.get('/register', (req, res) => {
    res.render('register');
})

// to sign up the form 
app.post('/register', async(req, res) => {
    const { password, username } = req.body;
    // instead we used pre-save
    // hash the password
    //const hash = await bcrypt.hash(password, 12);
    // sets username field to extracted username value
    // and password  field to the hashed password
    const user = new User({ username, password })
    // saves the user to database
    await user.save();
    // when we sign up we logged in as well
    req.session.user_id = user._id;
    // after doing all work takes to the homepage or any page specified
    res.redirect('/secret');
})

// to get the login ejs template
app.get('/login', (req, res) => {
    res.render('login');
})

// login in to the existing user
app.post('/login', async(req, res) => {
    // take the req.body and stores in the variables respectively
    const { username, password } = req.body;
    // below line calls the findAndValidate method defined for the User model
    //it passes the extracted username and password to this method
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        // if we are successfully logged in it with store the user id in the session and take
        // the user to secret page 
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    }else{
        res.redirect('/login');
    }
})

app.post('/logout', (req, res) => {
    // it will set the session to null and will redirect to login as there wont be any session available
    req.session.user_id = null;
    // the line below works same as the line above  
    // req.session.destroy();
    res.redirect('/login');
})

// we call the middleware and next passes control to the next middleware or route handler in the 
// request process, in this case it is req, res
app.get('/secret', requireLogin, (req, res) => {
    res.render('secret');
})

app.listen(3000, () => {
    console.log("Serving you app!");
})