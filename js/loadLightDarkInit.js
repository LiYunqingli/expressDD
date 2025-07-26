// 深色模式状态
let darkModeEnabled = false;
// 切换深色模式
function toggleDarkMode() {
    if (darkModeEnabled) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// 启用深色模式
function enableDarkMode() {
    DarkReader.enable({
        brightness: 100,
        contrast: 90,
        sepia: 10,
        exclude: ['.btn']
    });

    darkModeEnabled = true;
    localStorage.setItem('darkMode', 'true');
}

// 禁用深色模式
function disableDarkMode() {
    DarkReader.disable();
    darkModeEnabled = false;
    localStorage.setItem('darkMode', 'false');
}

// 检查深色模式状态
function isDarkModeEnabled() {
    return darkModeEnabled;
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    //获取系统主题
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? '深色模式' : '浅色模式';
    top.showMessage(systemTheme);
    // 获取用户设置的主题
    if (systemTheme === '深色模式') {
        enableDarkMode();
    } else {
        disableDarkMode();
    }

    // 添加控制台函数
    window.toggleDarkMode = toggleDarkMode;
    window.enableDarkMode = enableDarkMode;
    window.disableDarkMode = disableDarkMode;
    window.isDarkModeEnabled = isDarkModeEnabled;
});