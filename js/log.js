// 记录日志

// !!!!!!!必须首先加载lib.js，因为要引用其全局$HOST变量


// create by LiHuarong at 2025-11-4


// fuck!
top.pushLog = function (url, detail) {
    console.log("触发日志记录");

    let xhr = new XMLHttpRequest();
    xhr.open("POST", $HOST + "/log.php", true);
    // 表单数据
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // 不接收数据返回，不考虑是否记录成功
    xhr.send(`url=${encodeURIComponent(url)}&detail=${encodeURIComponent(detail)}`);
}