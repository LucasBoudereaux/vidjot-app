//Third Party
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
//Models
const User = require('../models/User')

module.exports = function (passport) {
    passport.use(new LocalStrategy({
        usernameField: 'email'
    }, async (email, password, done) => {
        const user = await User.findOne({
            email
        })
        //Check if we get a user
        if (!(user instanceof User)) {
            return done(null, false, { message: 'No user found !' })
        }
        //Check if password match.
        try {
            const isMatch = await bcrypt.compare(password, user.password)
            if (!isMatch) return done(null, false, { message: 'Password incorrect !' })
            return done(null, user)
        } catch (err) {
            if (err) throw err
        }
    }))
    //copy/paste from the passport's documentation but adapt to ES6 syntax
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}