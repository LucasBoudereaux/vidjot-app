const express = require('express')
const router = express.Router();

//Helpers
const { ensureAuthenticated } = require('../helpers/auth')

//Models
const Idea = require('../models/Idea')

router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('ideas/add')
})

router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
    const idea = await Idea.findOne({ _id: req.params.id })
    if (idea.user !== req.user.id) {
        req.flash('error_msg', 'Not Authorized')
        res.redirect('/ideas')
    }
    res.render('ideas/edit', {
        idea
    })
})

//crud
router.get('/', ensureAuthenticated, async (req, res) => {
    const ideas = await Idea.find({ user: req.user.id }).sort({ createdAt: 'desc' })
    res.render('ideas/index', {
        ideas
    })
})

router.post('/', ensureAuthenticated, async (req, res) => {
    let errors = []
    if (!req.body.title) {
        errors.push({ text: "Please, add a title" })
    }
    if (!req.body.details) {
        errors.push({ text: "Please, add details" })
    }
    if (errors.length > 0) {
        res.render('ideas/add', {
            errors,
            title: req.body.title,
            details: req.body.details
        })
    } else {
        try {
            await new Idea({
                title: req.body.title,
                details: req.body.details,
                user: req.user.id
            }).save()
            req.flash('success_msg', 'The idea has been created !')
        } catch (err) {
            req.flash('error_msg', 'Something wrong hrouterened...')
        }
        res.redirect('/ideas')
    }
})

router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const idea = await Idea.findOne({ _id: req.params.id })
        if (idea === null) throw err //no document found (maybe someone try to edit an idea of another person or try to edit an idea which the wrong id (in case of changes on the front size, espcially in the form action...))
        idea.title = req.body.title
        idea.details = req.body.details
        await idea.save()
        req.flash('success_msg', 'The idea has been updated.')
    } catch (err) {
        //someone try to edit an idea which not exists or not his own.
        req.flash('error_msg', 'You cannot edit this idea.')
    }
    res.redirect('/ideas')
})

router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const document = await Idea.findOneAndDelete({ _id: req.params.id, user: req.user.id })
        if (document === null) throw err //no document found (maybe someone try to delete an idea of another person or try to delete an idea which the wrong id (in case of changes on the front size, espcially in the form action...))
        req.flash('success_msg', 'The idea has been deleted.')
    } catch (err) {
        //someone try to delete an idea which not exists or not his own.
        req.flash('error_msg', 'You cannot delete this idea.')
    }
    res.redirect('/ideas')
})

module.exports = router