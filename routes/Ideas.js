const express = require('express')
const router = express.Router();

//Models
const Idea = require('../models/Idea')

router.get('/add', (req, res) => {
    res.render('ideas/add')
})

router.get('/edit/:id', async (req, res) => {
    const idea = await Idea.findOne({ _id: req.params.id })
    res.render('ideas/edit', {
        idea
    })
})

//crud
router.get('/', async (req, res) => {
    const ideas = await Idea.find({}).sort({ createdAt: 'desc' })
    res.render('ideas/index', {
        ideas
    })
})

router.post('/', async (req, res) => {
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
                details: req.body.details
            }).save()
            req.flash('success_msg', 'The idea has been created !')
        } catch (err) {
            req.flash('error_msg', 'Something wrong hrouterened...')
        }
        res.redirect('/ideas')
    }
})

router.put('/:id', async (req, res) => {
    try {
        const idea = await Idea.findOne({ _id: req.params.id })
        idea.title = req.body.title
        idea.details = req.body.details
        await idea.save()
        req.flash('success_msg', 'The idea has been updated.')
    } catch (err) {
        //someone try to edit an idea which not exists.
        req.flash('error_msg', 'The idea requested doesn\'t exist.')
    }
    res.redirect('/ideas')
})

router.delete('/:id', async (req, res) => {
    try {
        await Idea.findOneAndDelete({ _id: req.params.id })
        req.flash('success_msg', 'The idea has been deleted.')
    } catch (err) {
        //someone try to delete an idea which not exists.
        req.flash('error_msg', 'The idea requested doesn\'t exist.')
    }
    res.redirect('/ideas')
})

module.exports = router