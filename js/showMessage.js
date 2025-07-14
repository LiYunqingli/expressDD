// 挂载到top的函数
top.showMessage = function (message, duration = 3000, type = 'green') {
    // 创建消息盒子
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    if (type === 'red') {
        messageBox.classList.add('red');
    }
    messageBox.onclick = () => closeMessage(messageBox);

    // 添加消息内容
    messageBox.textContent = message;

    // 创建关闭按钮
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => closeMessage(messageBox);
    messageBox.appendChild(closeBtn);

    // 将消息盒子添加到body中
    document.body.appendChild(messageBox);

    // 触发显示动画
    setTimeout(() => messageBox.classList.add('show'), 10);

    // 自动关闭
    if (duration > 0) {
        setTimeout(() => closeMessage(messageBox), duration);
    }

    // 关闭消息盒子
    function closeMessage(box) {
        box.classList.remove('show');
        box.addEventListener('transitionend', () => box.remove());
    }

    // 调整消息盒子的位置
    adjustMessageBoxes();
};

// 调整消息盒子的位置
function adjustMessageBoxes() {
    const messageBoxes = document.querySelectorAll('.message-box');
    messageBoxes.forEach((box, index) => {
        box.style.top = `${20 + index * 60}px`;
    });
}