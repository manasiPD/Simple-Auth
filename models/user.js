const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username cannot be blank']
    },
    password: {
        type: String,
        required: [true, 'Password cannot be blank']
    },
})

// it is a static method called findAndValidate to user schema
// Find a User by Username
// Validate the Password
userSchema.statics.findAndValidate = async function(username, password){
    // this keyword is refer to the model itself(the user schema)
    // and then it finds the username as requested by the user from the database
    const foundUser = await this.findOne({ username });
    //checks the password inserted by the user matches the hashed password in the database
    const isValid = await bcrypt.compare(password, foundUser.password);
    // if provided password matches the stored hash (true) it returns foundUser
    // else return false 
    return isValid ? foundUser : false;
}

// this pre-save middleware function is designed to automatically hash the user's password 
// before saving it to the database
// The 'save' argument indicates that this middleware should be triggered when a user document is being saved
userSchema.pre('save', async function (next){
    // we only want to rehash the password if the password has been modified
    if(!this.isModified('password')) return next();
    //hashes the user's password
    // common practice to ensure that only the hashed password is stored in the database
    // 12 represents the numver of salt rounds
    this.password = await bcrypt.hash(this.password, 12);
    // next is used to continue the save operation after the middleware has executed
    next();
})

module.exports = mongoose.model('User', userSchema);