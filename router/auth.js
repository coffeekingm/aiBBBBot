import express from 'express';
import bcrypt from 'bcrypt';
import { getUsers } from '../config/database.js';

const router = express.Router();

// 注册路由
router.post('/register', async (req, res) => {
    try {
        const users = await getUsers();
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await users.insertOne({
            username,
            password: hashedPassword,
            created_at: new Date()
        });
        
        res.json({ success: true, message: '注册成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '注册失败', error: error.message });
    }
});

// 登录路由
router.post('/login', async (req, res) => {
    try {
        const users = await getUsers();
        const { username, password } = req.body;
        
        const user = await users.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ success: false, message: '用户名或密码错误' });
        }
        
        // 设置session
        req.session.userId = user._id.toString();
        req.session.username = user.username;
        
        res.json({ success: true, message: '登录成功' });
    } catch (error) {
        res.status(500).json({ success: false, message: '登录失败', error: error.message });
    }
});

// 登出路由
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: '已登出' });
});

export default router; 