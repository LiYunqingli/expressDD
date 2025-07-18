class ConfirmDialog {
    constructor() {
        this.overlay = document.getElementById('confirmOverlay');
        this.titleEl = document.getElementById('confirmTitle');
        this.messageEl = document.getElementById('confirmMessage');
        this.cancelBtn = document.getElementById('confirmCancel');
        this.confirmBtn = document.getElementById('confirmOk');

        // 绑定事件
        this.cancelBtn.addEventListener('click', () => this.hide());
        this.confirmBtn.addEventListener('click', () => this.hide());

        // 初始化状态
        this.isVisible = false;
    }

    show(options) {
        this.titleEl.textContent = options.title || '确认操作';
        this.messageEl.textContent = options.message || '确定要执行此操作吗？';

        // 设置回调
        this.onConfirm = options.onConfirm || (() => { });
        this.onCancel = options.onCancel || (() => { });

        // 更新按钮事件
        this.confirmBtn.onclick = () => {
            this.hide();
            this.onConfirm();
        };

        this.cancelBtn.onclick = () => {
            this.hide();
            this.onCancel();
        };

        // 显示弹窗
        this.overlay.classList.add('active');
        this.isVisible = true;

        // 添加ESC键关闭支持
        this.escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.hide();
                this.onCancel();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    hide() {
        this.overlay.classList.remove('active');
        this.isVisible = false;
        document.removeEventListener('keydown', this.escapeHandler);
    }
}

// 创建全局实例
const confirmDialog = new ConfirmDialog();