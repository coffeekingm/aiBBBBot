document.addEventListener('DOMContentLoaded', function () {
    const chatMessages = document.getElementById('chatMessages');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');

    // 监听输入框输入事件，根据输入内容改变发送按钮颜色
    messageInput.addEventListener('input', function () {
        const message = this.value.trim();
        if (message) {
            // 有文字时设置为蓝底白字
            sendButton.style.backgroundColor = '#0d6efd';
            sendButton.style.borderColor = '#0d6efd';
            sendButton.disabled = false;
        } else {
            // 无文字时恢复为灰色
            sendButton.style.backgroundColor = '#adb5bd';
            sendButton.style.borderColor = '#adb5bd';
            sendButton.disabled = true;
        }
    });

    // 发送消息的函数
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message) {
            // 显示用户消息
            const userMessage = document.createElement('div');
            userMessage.classList.add('message', 'user');
            userMessage.innerHTML = `<div class="message-content">${message}</div>`;
            chatMessages.appendChild(userMessage);
            // 清空输入框
            messageInput.value = '';

            // 添加loading消息
            const loadingMessage = document.createElement('div');
            loadingMessage.classList.add('message', 'bot');
            loadingMessage.innerHTML = `<div class="message-content"><span class="loading-dots"></span></div>`;
            chatMessages.appendChild(loadingMessage);

            // 禁用发送按钮
            sendButton.style.backgroundColor = '#adb5bd';
            sendButton.style.borderColor = '#adb5bd';
            sendButton.disabled = true;

            const {data:{message:bData}} = await axios({
                method: 'post',
                url: '/deepseek/api/chat',
                headers: {
                    'Content-Type': 'application/json'
                },
                data:  {content:message}
            });

            // 移除loading消息
            chatMessages.removeChild(loadingMessage);

            // 模拟机器人回复
            const botMessage = document.createElement('div'); 
            botMessage.classList.add('message', 'bot');
            botMessage.innerHTML = `<div class="message-content">${bData}</div>`;
            chatMessages.appendChild(botMessage);

            // 滚动到最新消息
            chatMessages.scrollTop = chatMessages.scrollHeight;

            // 输入框清空后，恢复按钮初始样式
            sendButton.style.backgroundColor = '#adb5bd';
            sendButton.style.borderColor = '#adb5bd';
            sendButton.disabled = true;
        }
    }

    // 点击发送按钮事件
    sendButton.addEventListener('click', sendMessage);

    // 按下回车键事件
    messageInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
});