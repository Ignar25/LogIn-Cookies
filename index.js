const express = require('express');
const session = require('express-session');
const time = 1000*60;

const app = express();

app.use(express.urlencoded({extended:true}))

const {
    PORT = 3000,
    NODE_ENV = 'development',
    SESS_NAME = 'Session ID',
    SESS_LIFETIME = time,
    SESS_SECRET = `Secret Login ID, Don't pass it`
} = process.env

const IN_PROD = NODE_ENV === 'production';

const users = [
    { id: 1, name: 'Luis', email: 'luis@gmail.com', password: 'password'},
    { id: 2, name: 'Pedro', email: 'pedro@gmail.com', password: 'password'},
    { id: 3, name: 'Pablo', email: 'pablo@gmail.com', password: 'password'}
]

app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        secure: IN_PROD
    }
}))

const redirectLogin = (req, res, next) => {
    if(!req.session.userId) {
        res.redirect('login')
    } else {
        next();
    }
}

const redirectHome = (req, res, next) => {
    if(req.session.userId) {
        res.redirect('home')
    } else {
        next();
    }
}

app.get('/', (req, res) =>{
    const { userId } = req.session
    console.log(userId);

    res.send(`
        <h1>Welcome!</h1>
        ${userId ? `
        <a href='/home'>Home</a>
        <form method='post' action='/logout'>
            <button>LogOut</button>
        </form>
        `: `
        <a href='/login'>LogIn</a>
        <a href='/register'>Sign Up</a>
        `}

    `)
})

app.get('/home', redirectLogin, (req, res) =>{
    const user = users.find(user => user.id === req.session.userId)

    res.send(`
        <h1>Home</h1>
        <a href='/'>Main</a>
        <ul>
            <li>Name: ${user.name}</li>
            <li>Email: ${user.email}</li>
        </ul>
    `)
})

app.get('/login', redirectHome, (req, res) =>{
    res.send(`
        <h1>Login</h1>
        <form method='post' action='/login'>
            <input type='email' name='email' placeholder='Email' require />
            <input type='password' name='password' placeholder='Password' require />
            <input type='submit' />
        </from>
        <br>
        Don't have an account? <a href='/register'>Register now!</a>
    `)
})

app.get('/register', redirectHome, (req, res) =>{
    res.send(`
    <h1>Register</h1>
    <form method='post' action='/register'>
        <input type='text' name='name' placeholder='Name' require />
        <input type='email' name='email' placeholder='Email' require />
        <input type='password' name='password' placeholder='Password' require />
        <input type='submit' />
    </from>
    <br>
    Alredy have an account? <a href='/login'>LogIn here</a>
`)
})

app.post('/login', redirectHome, (req, res) =>{
    const { email, password } = req.body;

    if ( email && password) {
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            req.session.userId = user.id;
            return res.redirect('/home');
        }
    }

    res.redirect('/login');
})

app.post('/register', redirectHome, (req, res) =>{
    const { name, email, password } = req.body;
    
    if (name && email && password) {
        const exists = users.some(
            user => user.email === email
        )

        if (!exists){
            const user = {
                id: users.length +1,
                name,
                email,
                password
            }

            users.push(user);

            req.session.userId = user.id;

            return res.redirect('/home');
        }
    }

    res.redirect('/register');
})

app.post('/logout', redirectLogin, (req, res) =>{
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/home')
        }

        res.clearCookie(SESS_NAME);
        res.redirect('/login');
    })
})

app.listen(PORT, () =>{
    console.log(`Listening in port ${PORT}`);
})