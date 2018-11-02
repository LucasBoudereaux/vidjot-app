//Core module (no need to install)
const path = require('path')
//Third party modules (need to install)
const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')
const session = require('express-session')
//we use flash message because when we delete or edit an idea, we are redirected //to see immediately the changes (and we cannot pass a plain message as we use to be with render).
const flash = require('connect-flash')
//Load routes
const ideasRoutes = require('./routes/Ideas')
const usersRoutes = require('./routes/Users')

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

//Static folder
app.use(express.static(path.join(__dirname, 'public')))

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

//Everything prefixed by '/ideas will use routes located in ./routes/Ideas.js
app.use('/ideas', ideasRoutes)

//Everything prefixed by '/users' will use routed located in ./routes/User.js
app.use('/users', usersRoutes)