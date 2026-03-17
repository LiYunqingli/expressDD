class SelectList {
    constructor() {
        this.selectedOptions = [];
        this.currentOptions = [];
        this.selectionCallback = null;
        this.columnMemory = {}; // 存储各列的记忆状态
        this.currentColumnKey = null; // 当前操作的列键
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'selectlist-modal';
        modal.id = 'selectlistModal';
        modal.innerHTML = `
            <div class="selectlist-overlay" id="selectlistOverlay"></div>
            <div class="selectlist-container">
                <div class="selectlist-header">
                    <h3 class="selectlist-title" id="selectlistTitle">请选择</h3>
                    <button class="selectlist-close-btn" id="selectlistCloseBtn"></button>
                </div>
                <div class="selectlist-search-container">
                    <input type="text" class="selectlist-search" id="selectlistSearch" placeholder="搜索选项...">
                </div>
                <div class="selectlist-options" id="selectlistOptions"></div>
                <div class="selectlist-footer">
                    <button class="selectlist-selectall-btn" id="selectlistSelectAllBtn">全选</button>
                    <button class="selectlist-cancel-btn" id="selectlistCancelBtn">取消</button>
                    <button class="selectlist-confirm-btn" id="selectlistConfirmBtn">确定</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 添加事件监听
        document.getElementById('selectlistOverlay').addEventListener('click', () => this.close(false));
        document.getElementById('selectlistCloseBtn').addEventListener('click', () => this.close(false));
        document.getElementById('selectlistCancelBtn').addEventListener('click', () => this.close(false));
        document.getElementById('selectlistConfirmBtn').addEventListener('click', () => this.close(true));
        document.getElementById('selectlistSelectAllBtn').addEventListener('click', () => this.toggleSelectAll());

        // 添加搜索功能
        document.getElementById('selectlistSearch').addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });

        // 监听transitionend事件来应用选项动画
        const container = document.querySelector('.selectlist-container');
        container.addEventListener('transitionend', () => {
            if (container.classList.contains('animating-options')) {
                this.animateOptions();
                container.classList.remove('animating-options');
            }
        });
    }

    setColumnKey(key) {
        this.currentColumnKey = key;

        // 如果没有该列的记忆，初始化
        if (!this.columnMemory[this.currentColumnKey]) {
            this.columnMemory[this.currentColumnKey] = {
                selectedValues: [],
                isSelectAll: true
            };
        }
    }

    show(title, options, callback) {
        const modal = document.getElementById('selectlistModal');
        const optionsContainer = document.getElementById('selectlistOptions');
        const titleElement = document.getElementById('selectlistTitle');
        const searchInput = document.getElementById('selectlistSearch');

        // 清除之前的选项和搜索词
        optionsContainer.innerHTML = '';
        searchInput.value = '';

        // 设置标题
        titleElement.textContent = title;

        // 存储选项和回调
        this.currentOptions = options;
        this.selectionCallback = callback;

        // 应用记忆的选择状态
        this.applyMemoryToOptions();

        // 添加加载指示器
        const loader = document.createElement('div');
        loader.className = 'selectlist-loading';
        optionsContainer.appendChild(loader);

        // 显示模态框
        modal.classList.add('visible');

        // 使用requestAnimationFrame渲染选项
        requestAnimationFrame(() => {
            // 移除加载指示器
            loader.remove();

            // 渲染所有选项
            this.renderOptions();

            // 标记容器需要选项动画
            document.querySelector('.selectlist-container').classList.add('animating-options');
        });
    }

    applyMemoryToOptions() {
        if (!this.currentColumnKey || !this.columnMemory[this.currentColumnKey]) return;

        const memory = this.columnMemory[this.currentColumnKey];

        this.currentOptions.forEach(option => {
            // 如果该选项的值在记忆的选择列表中，则选中
            option.selected = memory.selectedValues.includes(option.value);
        });

        this.selectedOptions = memory.selectedValues.slice();
    }

    renderOptions() {
        const optionsContainer = document.getElementById('selectlistOptions');
        optionsContainer.innerHTML = '';

        this.currentOptions.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'selectlist-option';
            optionElement.dataset.value = option.value;

            if (option.selected) {
                optionElement.classList.add('selected');
            }

            optionElement.innerHTML = `
                <div class="selectlist-checkbox">
                    <div class="selectlist-checkmark">${option.selected ? '✓' : ''}</div>
                </div>
                <div class="selectlist-text">${option.text}</div>
                <div class="selectlist-count">(${option.count})</div>
            `;

            optionElement.addEventListener('click', () => {
                this.toggleOption(index);
            });

            optionsContainer.appendChild(optionElement);
        });
    }

    toggleOption(index) {
        const option = this.currentOptions[index];
        const optionElement = document.querySelectorAll('.selectlist-option')[index];

        option.selected = !option.selected;

        if (option.selected) {
            optionElement.classList.add('selected');
            optionElement.querySelector('.selectlist-checkmark').innerHTML = '✓';
            if (!this.selectedOptions.includes(option.value)) {
                this.selectedOptions.push(option.value);
            }
        } else {
            optionElement.classList.remove('selected');
            optionElement.querySelector('.selectlist-checkmark').innerHTML = '';
            this.selectedOptions = this.selectedOptions.filter(val => val !== option.value);
        }

        // 更新全选按钮状态
        this.updateSelectAllButton();
    }

    toggleSelectAll() {
        const allOptions = document.querySelectorAll('.selectlist-option:not([style*="display: none"])');
        const selectedOptions = document.querySelectorAll('.selectlist-option.selected:not([style*="display: none"])');

        // 如果当前可见选项已全部选中，则取消全选
        const shouldSelectAll = selectedOptions.length !== allOptions.length;

        allOptions.forEach(option => {
            const value = option.dataset.value;
            const index = this.currentOptions.findIndex(opt => opt.value === value);

            if (index !== -1) {
                this.currentOptions[index].selected = shouldSelectAll;

                if (shouldSelectAll) {
                    option.classList.add('selected');
                    option.querySelector('.selectlist-checkmark').innerHTML = '✓';
                    if (!this.selectedOptions.includes(value)) {
                        this.selectedOptions.push(value);
                    }
                } else {
                    option.classList.remove('selected');
                    option.querySelector('.selectlist-checkmark').innerHTML = '';
                    this.selectedOptions = this.selectedOptions.filter(val => val !== value);
                }
            }
        });

        // 更新全选按钮文本
        const selectAllBtn = document.getElementById('selectlistSelectAllBtn');
        selectAllBtn.textContent = shouldSelectAll ? '全不选' : '全选';
    }

    updateSelectAllButton() {
        const allOptions = document.querySelectorAll('.selectlist-option:not([style*="display: none"])');
        const selectedOptions = document.querySelectorAll('.selectlist-option.selected:not([style*="display: none"])');

        const selectAllBtn = document.getElementById('selectlistSelectAllBtn');
        selectAllBtn.textContent = selectedOptions.length === allOptions.length ? '全不选' : '全选';
    }

    filterOptions(searchTerm) {
        const options = document.querySelectorAll('.selectlist-option');
        const lowerSearchTerm = searchTerm.toLowerCase();

        options.forEach(option => {
            const text = option.querySelector('.selectlist-text').textContent.toLowerCase();
            if (text.includes(lowerSearchTerm)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });

        // 更新全选按钮状态
        this.updateSelectAllButton();
    }

    animateOptions() {
        // 一次性为所有选项添加可见动画
        const options = document.querySelectorAll('.selectlist-option');
        requestAnimationFrame(() => {
            options.forEach(option => {
                option.classList.add('all-visible');
            });
        });
    }

    close(withSelection = false) {
        const modal = document.getElementById('selectlistModal');

        // 保存当前选择状态到记忆
        if (this.currentColumnKey) {
            this.columnMemory[this.currentColumnKey] = {
                selectedValues: this.selectedOptions.slice(),
                isSelectAll: this.selectedOptions.length === this.currentOptions.length
            };
        }

        // 直接关闭模态框
        modal.classList.remove('visible');

        // 执行回调（如果确认选择）
        if (withSelection && this.selectionCallback) {
            this.selectionCallback(this.currentOptions.filter(opt => opt.selected));
        }
    }
}

// 导出单例实例
window.selectList = new SelectList();