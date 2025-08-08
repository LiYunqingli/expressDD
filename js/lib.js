// 此文件式关于本项目的一些常用方法，统一封装到此文件中，方便调用
// 如果添加了新的方法，请在此文件中添加注释说明并且在开发者文档中增加对应的说明，方便他人使用

//2024-12-29 by LiHuarong

//2025-07-12 by LiHuarong 从代码仓库中复用本lib.js库

// ----------------------------------

/* 主机地址 */const $MAIN = "https://kd.lihuarong.cn:8080";

const $HOST = $MAIN + "/php";
const $HOST_HOME = $MAIN + "/login.html"//登录页

/* 请注意开发的时候修改为开发地址，部署服务使应当修改为服务器地址 */

// ----------------------------------


//检查登录状态以及验证token的是否存在
function checkLoginToken() {
    let token = getToken();
    if (token == null) {
        return false;
    } else {
        console.log("token: " + token);
        return true;
    }
}

//检查token是否合法，如果合法则log，否则执行loginOut
function checkLoginTokenIsTrue() {
    let token = getToken();
    if (!token) {
        top.location.reload();//整个标签页刷新而不是单单iframe
        window.location.href = $HOST_HOME;//避免非iframe的访问
    }


    let xhr = new XMLHttpRequest();
    xhr.open("POST", $HOST + "/checkToken.php", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let response = JSON.parse(xhr.responseText);
            if (response.code == 200) {
                console.log("token is true");
                //判断window.type是否有数据，如果有则在验证成功后跳转（login.html）专属
                if (window.type != null) {
                    console.log("window.type: " + window.type);
                    if (window.type == "login") {
                        window.location.href = $MAIN + "/index.html";
                    }
                }
            } else {
                // loginOut();
                //原本是直接退出，改为先提示然后退出（原先是某些情况登录后立刻退出）
                top.showMessage(response.msg);
                setTimeout(function () {
                    loginOut();
                }, 3000);
            }
        }
    }
    xhr.send("token=" + token);
}

//获取token，全局
function getToken() {
    return localStorage.getItem("token");
}

//退出登录
function loginOut() {

    // localStorage.removeItem("token");
    localStorage.clear();
    top.location.reload();
}

//获取url中的参数
function getUrlParam(name, url) {
    // 如果没有传入url参数，则使用当前页面URL
    url = url || window.location.href;

    // 转义特殊字符，处理参数名中的特殊符号
    name = name.replace(/[\[\]]/g, '\\$&');

    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(url);

    if (!results) return null;
    if (!results[2]) return '';

    // 解码URL参数值
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * 添加或修改URL参数（不刷新页面）
 * @param {string} key - 参数名
 * @param {string} value - 参数值
 * @param {boolean} [replace=false] - 是否替换当前历史记录（默认添加新记录）
 */
function updateUrlParam(key, value, replace = false) {
    // 创建当前URL的解析对象
    const url = new URL(window.location.href);

    // 检查参数是否存在
    const hasParam = url.searchParams.has(key);

    // 存在则修改，不存在则添加
    url.searchParams.set(key, value);

    // 构建新URL（保留哈希部分）
    const newUrl = url.pathname + url.search + url.hash;

    // 使用History API更新URL（不刷新页面）
    const historyMethod = replace ? 'replaceState' : 'pushState';
    window.history[historyMethod]({ key, value }, document.title, newUrl);

    console.log(`参数 "${key}" ${hasParam ? '已修改' : '已创建'}: ${newUrl}`);
}

/**
 * 移除URL中所有查询参数（不刷新页面）
 * @param {boolean} [replace=true] - 是否替换当前历史记录（默认替换，不产生新记录）
 */
function removeAllUrlParams(replace = true) {
    // 获取当前路径和哈希部分
    const path = window.location.pathname;
    const hash = window.location.hash;

    // 构建不含参数的URL
    const newUrl = path + (hash || '');

    // 使用History API更新URL
    const historyMethod = replace ? 'replaceState' : 'pushState';
    window.history[historyMethod]({}, document.title, newUrl);

    console.log('已移除所有URL参数:', newUrl);
}