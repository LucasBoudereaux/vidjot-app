//Third party
const express = require('express')
const bcrypt = require('bcryptjs')
const passport = require('passport')
//Models
const User = require('../models/User')
//Router
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true,
    })(req, res, next)
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You successfully logout.')
    res.redirect('/users/login')
})

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', async (req, res) => {
    let errors = []
    if (req.body.password !== req.body.confirm) {
        errors.push({
            text: 'Password doesn\'t match...'
        })
    }
    if (req.body.password.length < 4) {
        errors.push({
            text: 'Password is too short (min. 4)'
        })
    }
    if (errors.length > 0) {
        res.render('users/register', {
            errors,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            confirm: req.body.confirm
        })
    } else {
        //Check if email already exists
        const user = await User.findOne({ email: req.body.email })
        if (user instanceof User) {
            req.flash('error_msg', 'This email already exists.')
            //we use return to prevent below execution code (we also could have been used an else statement)
            return res.redirect('/users/register')
        }
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(req.body.password, salt)
        try {
            await new User({
                name: req.body.name,
                email: req.body.email,
                password: hashPassword
            }).save()
            req.flash('success_msg', 'You successfully registered, you can now login.')
            return res.redirect('/users/login')
        } catch (err) {
            console.log(err)
            return
        }
    }
})

module.exports = router