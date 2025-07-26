class RadioList {
    constructor() {
        this.currentSelection = null;
        this.currentOptions = [];
        this.selectionCallback = null;
        this.createModal();
    }
    
    createModal() {
        const modal = document.createElement('div');
        modal.className = 'radiolist-modal';
        modal.id = 'radiolistModal';
        modal.innerHTML = `
            <div class="radiolist-overlay" id="radiolistOverlay"></div>
            <div class="radiolist-container">
                <div class="radiolist-header">
                    <h3 class="radiolist-title" id="radiolistTitle">请选择</h3>
                    <button class="radiolist-close-btn" id="radiolistCloseBtn"></button>
                </div>
                <div class="radiolist-options" id="radiolistOptions"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 添加事件监听
        document.getElementById('radiolistOverlay').addEventListener('click', () => this.close(false));
        document.getElementById('radiolistCloseBtn').addEventListener('click', () => this.close(false));
        
        // 监听transitionend事件来应用选项动画
        const container = document.querySelector('.radiolist-container');
        container.addEventListener('transitionend', () => {
            if (container.classList.contains('animating-options')) {
                this.animateOptions();
                container.classList.remove('animating-options');
            }
        });
    }
    
    show(title, options, callback) {
        const modal = document.getElementById('radiolistModal');
        const optionsContainer = document.getElementById('radiolistOptions');
        const titleElement = document.getElementById('radiolistTitle');
        
        // 清除之前的加载状态
        optionsContainer.innerHTML = '';
        
        // 设置标题
        titleElement.textContent = title;
        
        // 存储选项和回调
        this.currentOptions = options;
        this.selectionCallback = callback;
        this.currentSelection = null;
        
        // 添加加载指示器
        const loader = document.createElement('div');
        loader.className = 'radiolist-loading';
        optionsContainer.appendChild(loader);
        
        // 显示模态框
        modal.classList.add('visible');
        
        // 使用requestAnimationFrame渲染选项，确保在动画帧内完成
        requestAnimationFrame(() => {
            // 移除加载指示器
            loader.remove();
            
            // 渲染所有选项
            this.currentOptions.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'radiolist-option';
                if (option.selected) {
                    optionElement.classList.add('selected');
                    this.currentSelection = index;
                }
                
                optionElement.innerHTML = `
                    <div class="radiolist-icon">${option.selected ? '✓' : ''}</div>
                    <div class="radiolist-text">${option.text}</div>
                `;
                
                optionElement.addEventListener('click', () => {
                    this.selectOption(index);
                    this.close(true);
                });
                
                optionsContainer.appendChild(optionElement);
            });
            
            // 标记容器需要选项动画
            document.querySelector('.radiolist-container').classList.add('animating-options');
        });
    }
    
    selectOption(index) {
        const options = document.querySelectorAll('.radiolist-option');
        
        if (this.currentSelection !== null) {
            options[this.currentSelection].classList.remove('selected');
            options[this.currentSelection].querySelector('.radiolist-icon').innerHTML = '';
            this.currentOptions[this.currentSelection].selected = false;
        }
        
        options[index].classList.add('selected');
        options[index].querySelector('.radiolist-icon').innerHTML = '✓';
        this.currentOptions[index].selected = true;
        this.currentSelection = index;
    }
    
    animateOptions() {
        // 一次性为所有选项添加可见动画
        const options = document.querySelectorAll('.radiolist-option');
        requestAnimationFrame(() => {
            options.forEach(option => {
                option.classList.add('all-visible');
            });
        });
    }
    
    close(withSelection = false) {
        const modal = document.getElementById('radiolistModal');
        
        // 直接关闭模态框
        modal.classList.remove('visible');
        
        // 执行回调（如果选择了选项）
        if (withSelection && this.selectionCallback && this.currentSelection !== null) {
            this.selectionCallback(this.currentOptions[this.currentSelection]);
        }
    }
}

// 导出单例实例
window.radioList = new RadioList();