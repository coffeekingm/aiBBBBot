import 'dotenv/config'
import express from "express"
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url';
import {client} from './config/database.js'
import MongoStore from 'connect-mongo'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import dsr from './router/deepseek.js'
import authRouter from './router/auth.js'

app.set('views', path.join(__dirname, 'view'));
app.set('view engine', 'ejs');

// 添加 session 中间件
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // 生产环境启用 HTTPS
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    },
    store: MongoStore.create({
        client, 
        dbName: 'deepseek', 
        ttl: 14 * 24 * 60 * 60, 
        autoRemove: 'native' 
    })
}));

app.use('/deepseek',dsr);
app.get('/',(req,res)=>res.redirect('/deepseek'));

app.use('/auth', authRouter);

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register'); // 需要创建 register.ejs
});

app.use(express.static('public'))

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false, 
        message: '服务器错误'
    });
});

app.listen(3000,(req,res)=>{
    console.log("app runningat localhost 3000");
})