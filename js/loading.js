// 确保top对象存在
if (typeof top === 'undefined') {
    var top = window;
}

// 显示加载动画 - 复用或创建元素
top.showLoading = function (detail = "加载中...") {
    // 检查元素是否已存在
    let loading = document.querySelector('.loading_loading');

    if (loading) {
        // 如果存在，只更新文本内容
        const text = loading.querySelector('.loading_text');
        if (text) {
            text.textContent = detail;
        }
        return; // 提前返回，无需创建新元素
    }

    // 如果不存在，则创建新的加载元素
    loading = document.createElement('div');
    loading.className = 'loading_loading';

    // 创建 spinner
    const spinner = document.createElement('div');
    spinner.className = 'loading_spinner';

    // 创建文本元素
    const text = document.createElement('div');
    text.className = 'loading_text';
    text.textContent = detail;

    // 组装元素
    loading.appendChild(spinner);
    loading.appendChild(text);
    document.body.appendChild(loading);
};

// 关闭加载动画 - 删除元素
top.closeLoading = function () {
    const loading = document.querySelector('.loading_loading');
    if (loading) {
        loading.remove();
    }
};
