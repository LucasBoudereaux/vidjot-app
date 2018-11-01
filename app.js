//Third party modules
const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
//we use flash message because when we delete or edit an idea, we are redirected //to see immediately the changes (and we cannot pass a plain message as we use to be with render).
const flash = require('connect-flash')


//Models
const Idea = require('./models/Idea')

//Config
const config = require('./config')
const pjson = require('./package.json')

//Server and DB connection
const app = express()

app.listen(config.SERVER_PORT, async () => {
    console.log(`Server is running on port ${config.SERVER_PORT}`)
    try {
        await mongoose.connect(config.DATABASE_URL, {
            useNewUrlParser: true
        })
        console.log("MongoDB connected.")
    } catch (err) {
        console.log(`An error occured while connecting to the database\n${err}`)
    }
})

//Handlebars middlewares
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')

//BodyParser middlewares
//To be able to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))
//To be able to parse application/json
app.use(bodyParser.json())

//Override method middleware
app.use(methodOverride('_method'))

//Express session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//Connect flash middleware
app.use(flash())

//Global variables middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

//Routes
app.get('/', (req, res) => {
    res.render('index', { title: "Welcome !" })
})

app.get('/about', (req, res) => {
    res.render('about', {
        version: pjson.version
    })
})

app.get('/ideas/add', (req, res) => {
    res.render('ideas/add')
})

app.get('/ideas/edit/:id', async (req, res) => {
    const idea = await Idea.findOne({ _id: req.params.id })
    res.render('ideas/edit', {
        idea
    })
})

app.get('/ideas', async (req, res) => {
    const ideas = await Idea.find({}).sort({ createdAt: 'desc' })
    res.render('ideas/index', {
        ideas
    })
})

app.post('/ideas', async (req, res) => {
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
            req.flash('error_msg', 'Something wrong happened...')
        }
        res.redirect('/ideas')
    }
})

app.put('/ideas/:id', async (req, res) => {
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

app.delete('/ideas/:id', async (req, res) => {
    try {
        await Idea.findOneAndDelete({ _id: req.params.id })
        req.flash('success_msg', 'The idea has been deleted.')
    } catch (err) {
        //someone try to delete an idea which not exists.
        req.flash('error_msg', 'The idea requested doesn\'t exist.')
    }
    res.redirect('/ideas')
})