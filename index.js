import 'dotenv/config'
import express from "express"
import session from 'express-session'
import path from 'path'
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
import dsr from './router/deepseek.js'
import authRouter from './router/auth.js'

app.set('views', './view');
app.set('view engine', 'ejs');

// 添加 session 中间件
app.use(session({
    secret: process.env.SESSION_SECRET, // 请更改为您自己的密钥
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // 如果使用 HTTPS 则设为 true
        maxAge: 1000 * 60 * 60 * 24 // 24小时
    }
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



app.listen(3000,(req,res)=>{
    console.log("app runningat localhost 3000");
})