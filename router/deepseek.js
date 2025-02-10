import express from "express";
import axios from "axios";
import { getChats } from '../config/database.js';

const router = express.Router();

// 中间件：检查用户是否已登录
const checkAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: '请先登录' });
    }
    next();
};

router.get("/", (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render("deepseek", { session: req.session });
});

// 聊天API路由
router.post('/api/chat', checkAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.session.userId;
        
        const options = {
            method: 'post',
            url: 'https://api.siliconflow.cn/v1/chat/completions',
            headers: {
                Authorization: `Bearer ${process.env.SILICONFLOW_APIKEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                "model": "deepseek-ai/DeepSeek-V3",
                "messages": [{ "role": "user", "content": content }],
                "stream": false,
                "max_tokens": 4000,
                "stop": ["null"],
                "temperature": 0.7,
                "top_p": 0.7,
                "top_k": 50,
                "frequency_penalty": 0.5,
                "n": 1,
                "response_format": { "type": "text" }
            }
        };

        const { data } = await axios(options);
        const response = data?.choices?.[0]?.message?.content || 'empty';
        
        const chats = await getChats();
        await chats.insertOne({
            user_id: userId,
            message: content,
            response: response,
            created_at: new Date()
        });
        
        res.json({ success: true, message: response });
    } catch (error) {
        res.status(500).json({ success: false, message: '处理失败', error: error.message });
    }
});

// 获取聊天历史
router.get('/history', checkAuth, async (req, res) => {
    try {
        const userId = req.session.userId;
        const chats = await getChats();
        const history = await chats.find({ user_id: userId })
            .sort({ created_at: -1 })
            .limit(50)
            .toArray();
        
        res.json({ success: true, history });
    } catch (error) {
        res.status(500).json({ success: false, message: '获取历史记录失败', error: error.message });
    }
});

export default router;