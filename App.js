const express = require('express')
const app = express();
const path = require('path')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const session = require('express-session')
const bcrypt = require('bcryptjs')
const port = process.env.PORT || 4455
app.use(express.static(path.join(__dirname, 'Public')))

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'Views'))

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false
}))

app.get('/',(req, res) => {
    res.render('index')
})
app.get('/login', (req, res) => {
    res.render('login')
})
app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/about',(req, res) => {
    res.render('about')
})
app.get('/blog',(req, res) => {
    res.render('blog')
})
app.get('/course-inner',(req, res) => {
    res.render('course-inner')
})
app.get('/courses',(req, res) => {
    res.render('courses')
})
app.get('/contact',(req, res) => {
    res.render('contact')
})
app.get('/post',(req, res) => {
    res.render('post')
})
const { User } = require('./db')

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) return next()
    return res.redirect('/admin')
}

app.get('/admin',(req, res) => {
    res.render('admin')
})
app.post('/admin', (req, res) => {
    const email = (req.body.email || '').toLowerCase().trim()
    const password = (req.body.password || '').trim()
    if (email === 'admin@gmail.com' && password === '123') {
        req.session.isAdmin = true
        return res.redirect('/')
    }
    return res.status(401).render('admin', { error: 'Invalid email or password' })
})
app.get('/adminhome', requireAdmin, (req, res) => {
    res.render('adminhome')
})
app.get('/addstd',(req,res)=>{
    res.render('addstd')
})
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body
        const exists = await User.findOne({ email })
        if (exists) return res.status(400).render('signup', { error: 'Email already in use' })
        const passwordHash = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, passwordHash })
        req.session.userId = user._id
        return res.redirect('/')
    } catch (e) {
        return res.status(500).render('signup', { error: 'Signup failed' })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(401).render('login', { error: 'Invalid credentials' })
        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return res.status(401).render('login', { error: 'Invalid credentials' })
        req.session.userId = user._id
        return res.redirect('/')
    } catch (e) {
        return res.status(500).render('login', { error: 'Login failed' })
    }
})

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})
app.listen(port, () => {
    console.log(`Server running: http://localhost:${port}/`)
})

// mongoose connection
mongoose.connect('mongodb://localhost:27017/education', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// models loaded via require('./db')

