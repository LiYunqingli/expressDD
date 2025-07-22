// 全局的数据
top.data = []
// DOM元素
const tabs = document.querySelectorAll('.tab');
const tableBody = document.querySelector('#records-table tbody');
const addModal = document.getElementById('add-modal');
const editModal = document.getElementById('edit-modal');
const addRecordBtn = document.getElementById('add-record');
const actionButtons = document.getElementById('action-buttons');
const actionsHeader = document.querySelector('.actions-header');
const dateSelect = document.getElementById('date-select');
let isFirst = true;

// 当前活动标签
let activeTab = 'deliver';
// 当前编辑的记录ID
let currentEditId = null;
// 渲染表格数据
function renderTable(data, style = '') {
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');

        row.innerHTML = `
                    <td>${item.building}</td>
                    <td>${item.room}</td>
                    <td>${item.pickupCode}</td>
                    <td>${item.expressNumber}</td>
                    <td>${item.notes}</td>
                    <td>${item.insert_time}</td>
                `;

        // 如果是编辑模式，添加操作列
        if (activeTab === 'edit') {
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            actionsCell.innerHTML = `
                        <button class="action-btn edit" data-id="${item.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" data-id="${item.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    `;
            row.appendChild(actionsCell);
        }

        tableBody.appendChild(row);
        if (style == '1') {

            actionsHeader.style.display = 'none';
            document.querySelectorAll(".actions").forEach((element) => {
                element.style.display = 'none';
            });//隐藏操作列
        } else {
            console.log('默认方法调用');
        }

    });
}


// 打开新增记录弹窗
function openAddModal() {
    // 重置表单
    document.getElementById('building-add').value = '';
    document.getElementById('room-add').value = '';
    document.getElementById('pickup-code-add').value = '';
    document.getElementById('express-number-add').value = '';
    document.getElementById('notes-add').value = '';

    addModal.style.display = 'flex';
}

// 打开修改记录弹窗
function openEditModal(id) {
    const record = top.data.find(item => item.id === id);
    if (!record) return;

    currentEditId = id;

    // 填充表单
    document.getElementById('id-edit').value = record.id;
    document.getElementById('building-edit').value = record.building;
    document.getElementById('room-edit').value = record.room;
    document.getElementById('pickup-code-edit').value = record.pickupCode;
    document.getElementById('express-number-edit').value = record.expressNumber;
    document.getElementById('notes-edit').value = record.notes;
    document.getElementById('pickup-time-edit').value = record.time;

    editModal.style.display = 'flex';
}

// 关闭弹窗
function closeModal() {
    addModal.style.display = 'none';
    editModal.style.display = 'none';
}

// 添加新记录
function addRecord() {
    const newRecord = {
        token: getToken(),
        time: document.getElementById('pickup-time-add').value,
        building: document.querySelector('#building-add select').value,
        room: document.getElementById('room-add').value,
        pickupCode: document.getElementById('pickup-code-add').value,
        expressNumber: document.getElementById('express-number-add').value,
        notes: document.getElementById('notes-add').value
    };
    let xhr = new XMLHttpRequest();
    xhr.open("POST", $HOST + "/addData.php", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
            let result = JSON.parse(xhr.responseText);
            if (result.code == 200) {
                getData();
                //刷新数据
                closeModal();
                top.showMessage(result.msg);
            } else {
                top.showMessage(result.msg, 3000, "red");
            }
        }
    };
    xhr.send(JSON.stringify(newRecord));
}

// 更新记录
function updateRecord() {
    const record = top.data.find(item => item.id === currentEditId);
    if (record) {
        record.token = getToken();
        record.time = document.getElementById('pickup-time-edit').value;
        record.building = document.getElementById('building-edit').value;
        record.room = document.getElementById('room-edit').value;
        record.pickupCode = document.getElementById('pickup-code-edit').value;
        record.expressNumber = document.getElementById('express-number-edit').value;
        record.notes = document.getElementById('notes-edit').value;

        console.log(record);
        let xhr = new XMLHttpRequest();
        xhr.open("POST", $HOST + "/editData.php", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                let result = JSON.parse(xhr.responseText);
                if (result.code == 200) {
                    getData();
                    //刷新数据
                    closeModal();
                    top.showMessage(result.msg);
                } else {
                    top.showMessage(result.msg, 3000, "red");
                }
            }
        };
        xhr.send(JSON.stringify(record));
    }
}

// 删除记录
function deleteRecord(id) {
    confirmDialog.show({
        title: "确认删除数据吗？",
        message: "删除后数据将无法恢复，请谨慎操作！",
        onConfirm: () => {
            let xhr = new XMLHttpRequest();
            xhr.open("POST", $HOST + "/delData.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    console.log(xhr.responseText);
                    let result = JSON.parse(xhr.responseText);
                    if (result.code == 200) {
                        getData();
                        renderTable(top.data);
                        closeModal();
                        top.showMessage(result.msg);
                    } else {
                        top.showMessage(result.msg, 3000, "red");
                    }
                }
            };
            xhr.send(`token=${getToken()}&id=${id}`);
        },
        onCancel: () => {
            console.log("删除操作已取消");
        }
    });
}

function setToday(type = 'null') {
    if (type == 'null') {
        let localStorage_date = localStorage.getItem(getUrlParam('localToken'));
        if (localStorage_date != null && localStorage_date != '') {
            dateSelect.value = localStorage_date;
        } else {
            //设置当天time
            let pickup_time_add = document.getElementById('pickup-time-add');
            //设置value为当前时间
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth() + 1; // 月份从0开始，需要加1
            var day = today.getDate();
            // 格式化为"yyyy-mm-dd"的日期字符串
            var formattedDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
            pickup_time_add.value = formattedDate;
            dateSelect.value = formattedDate;//主页面的日期选择器
        }
    } else if (type == 'today') {
        //设置当天time
        let pickup_time_add = document.getElementById('pickup-time-add');
        //设置value为当前时间
        var today = new Date();
        var year = today.getFullYear();
        var month = today.getMonth() + 1; // 月份从0开始，需要加1
        var day = today.getDate();
        // 格式化为"yyyy-mm-dd"的日期字符串
        var formattedDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
        pickup_time_add.value = formattedDate;
        dateSelect.value = formattedDate;//主页面的日期选择器
        removeAllUrlParams();
        delAllLocalToken();
        getData();
        top.showMessage('已更新为当天数据');
    }
}

//获取今天有多少单
function setTotalNum() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getTodayNum.php?' + `today=${dateSelect.value}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            if (result.code == 200) {
                document.getElementById("todayNum").innerText = result.num;
            }
        }
    }
    xhr.send();
    let xhr_1 = new XMLHttpRequest();
    xhr_1.open('GET', $HOST + '/getMonthNum.php?' + `today=${dateSelect.value}`, true);
    xhr_1.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr_1.onreadystatechange = function () {
        if (xhr_1.readyState === 4 && xhr_1.status === 200) {
            let result = JSON.parse(xhr_1.responseText);
            if (result.code == 200) {
                document.getElementById("monthNum").innerText = result.num;
            }
        }
    }
    xhr_1.send();
}

// insert id = building-add //动态加载新建model中的栋
function loadBuilding() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getBuildingLists.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            console.log(result);
            result = result.data;
            top.buildingData = result;
            if (isFirst) {
                song();
            } else {
                isFirst = false;
            }
            let shuchu = "<option value='null' selected>请选择</option>";
            for (let i = 0; i < result.length; i++) {
                shuchu += `
                            <option value="${result[i].input}">${result[i].input}</option>
                        `;
            }
            // building-edit
            document.getElementById("building-add").innerHTML = "<select>" + shuchu + "</select>";
            document.getElementById("building-edit").innerHTML = shuchu;
        }
    }
    xhr.send();
}

function song() {
    console.log("song");
    let new_data = top.data; // 假设data是外部传入的原始数据
    console.log(new_data);
    console.log(top.buildingData);

    // 1. 将buildingData按id升序排序
    const sortedBuildings = [...top.buildingData].sort((a, b) =>
        parseInt(a.id) - parseInt(b.id)
    );

    // 2. 创建映射：print -> 分组数据
    const groups = {};
    sortedBuildings.forEach(building => {
        groups[building.print] = [];
    });

    // 3. 分组数据
    new_data.forEach(item => {
        if (groups.hasOwnProperty(item.building)) {
            groups[item.building].push(item);
        } else {
            // 如果不存在匹配的分组，放入"其他"分组
            groups["其他"].push(item);
        }
    });

    // 4. 每组按room升序排序（数字排序）
    sortedBuildings.forEach(building => {
        const group = groups[building.print];
        if (group) {
            group.sort((a, b) =>
                parseInt(a.room) - parseInt(b.room)
            );
        }
    });

    // 5. 按分组顺序合并数据
    const result = [];
    sortedBuildings.forEach(building => {
        if (groups[building.print]) {
            result.push(...groups[building.print]);
        }
    });

    // 6. 更新new_data
    new_data = result;
    console.log("处理后的new_data:", new_data);
    renderTable(new_data, '1');
}

function qu() {
    console.log("qu");
    let new_data = top.data; // 使用原始数据副本

    // 分类数组
    var type_zimu = []; // [X]x-xxxx[0] 
    var type_str = [];  // 开头第一个必须非大小写字母和数字
    var type_you = [];  // [YOU]xx-x-xxxx
    var type_cai = [];  // [CAI]xx-x-xxxx
    var type_num = [];  // xx-x-xxxxx

    // 分类逻辑
    for (let i = 0; i < new_data.length; i++) {
        var pickupCode = new_data[i].pickupCode;
        if (/[A-Za-z]/.test(pickupCode[0])) {
            if (pickupCode.startsWith("YOU")) {
                type_you.push(new_data[i]);
            } else if (pickupCode.startsWith("CAI")) {
                type_cai.push(new_data[i]);
            } else {
                type_zimu.push(new_data[i]);
            }
        } else {
            if (/[0-9]/.test(pickupCode[0])) {
                type_num.push(new_data[i]);
            } else {
                type_str.push(new_data[i]);
            }
        }
    }

    // 1. 排序type_zimu（字母开头的）
    type_zimu.sort((a, b) => {
        const aParts = a.pickupCode.split('-');
        const bParts = b.pickupCode.split('-');

        // 提取首字母（大写）
        const aLetter = aParts[0].charAt(0).toUpperCase();
        const bLetter = bParts[0].charAt(0).toUpperCase();

        // 字母优先级排序
        if (aLetter !== bLetter) {
            return aLetter.localeCompare(bLetter);
        }

        // 提取前半部分数字（去掉字母）
        const aPrefixNum = parseInt(aParts[0].substring(1)) || 0;
        const bPrefixNum = parseInt(bParts[0].substring(1)) || 0;

        // 前半部分数字排序
        if (aPrefixNum !== bPrefixNum) {
            return aPrefixNum - bPrefixNum;
        }

        // 后半部分排序（补0到5位）
        const aSuffix = aParts[1].padStart(5, '0');
        const bSuffix = bParts[1].padStart(5, '0');
        return aSuffix.localeCompare(bSuffix);
    });

    // 2. type_str无需排序

    // 3. 排序type_you（忽略YOU前缀）
    type_you.sort((a, b) => {
        const aCode = a.pickupCode.replace('YOU', '');
        const bCode = b.pickupCode.replace('YOU', '');
        return aCode.localeCompare(bCode);
    });

    // 4. 排序type_cai（忽略CAI前缀）
    type_cai.sort((a, b) => {
        const aCode = a.pickupCode.replace('CAI', '');
        const bCode = b.pickupCode.replace('CAI', '');
        return aCode.localeCompare(bCode);
    });

    // 5. 排序type_num（数字开头的）
    type_num.sort((a, b) => {
        return a.pickupCode.localeCompare(b.pickupCode);
    });

    // 合并结果（按指定顺序）
    const result = [
        ...type_zimu,
        ...type_str,
        ...type_you,
        ...type_cai,
        ...type_num
    ];
    console.log(result);
    renderTable(result, '1');
    // return result;
}

// 获取核心数据
function getData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getData.php?' + `type=${dateSelect.value}&token=${getToken()}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const result = JSON.parse(xhr.responseText);
            if (result.code === 200) {
                top.data = result.data;
                console.log("数据更新：" + result.data);
                renderTable(top.data);
                // document.querySelector('.active').click()
            } else {
                top.showMessage(result.msg, 3000, "red");
                top.data = result.data;
                console.log("空数据更新：" + result.data);
                tableBody.innerHTML = '';
            }
        }
    };
    xhr.send();
}

//删除所有本地token
function delAllLocalToken() {
    //删除所有$开头的localStorage
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("$")) {
            localStorage.removeItem(key);
        }
    }
}

// 初始化页面
function init() {
    setToday();
    loadBuilding();
    getData();
    // 标签切换事件
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有active类
            tabs.forEach(t => t.classList.remove('active'));
            // 添加active类到当前标签
            tab.classList.add('active');

            activeTab = tab.dataset.tab;

            // 显示/隐藏操作按钮
            if (activeTab === 'edit') {
                actionButtons.style.display = 'flex';
                actionsHeader.style.display = 'table-cell';
                renderTable(top.data);
            } else {
                actionButtons.style.display = 'none';
                actionsHeader.style.display = 'none';
            }

            // 重新渲染表格
            // renderTable(top.data);
        });
    });

    // 打开新增记录弹窗
    addRecordBtn.addEventListener('click', openAddModal);

    // 关闭弹窗按钮事件
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // 取消按钮事件
    document.getElementById('cancel-add-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-edit-btn').addEventListener('click', closeModal);

    // 保存按钮事件
    document.getElementById('save-add-btn').addEventListener('click', addRecord);
    document.getElementById('save-edit-btn').addEventListener('click', updateRecord);

    // 点击弹窗外部关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // 日期筛选器
    dateSelect.addEventListener('change', () => {
        top.showMessage('选择的日期：' + dateSelect.value);
        document.getElementById("todayNum").innerText = "xx";
        document.getElementById("monthNum").innerText = "xx";
        let localKey = generateToken();
        delAllLocalToken();
        localStorage.setItem(localKey, dateSelect.value);
        updateUrlParam("localToken", localKey);
        setTotalNum();
        getData();//更新数据
    });

    // 编辑和删除按钮事件委托
    tableBody.addEventListener('click', (e) => {
        if (e.target.closest('.edit')) {
            const id = e.target.closest('.edit').dataset.id;
            openEditModal(id);
        } else if (e.target.closest('.delete')) {
            const id = e.target.closest('.delete').dataset.id;
            deleteRecord(id);
        }
    });
    setTotalNum();
}

// 导出所有数据到xlsx（支持URL下载）
function exportData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getAllData.php?token=' + getToken(), true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.responseType = 'json'; // 设置响应类型为JSON，自动解析
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                const data = xhr.response;
                if (data.code == 200) {
                    top.showMessage(data.msg);
                    
                    // 准备数据
                    const { users, data: _data, building } = data.data;
                    
                    // 1. 创建工作簿
                    const wb = XLSX.utils.book_new();
                    
                    // 2. 创建工作表
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(users), '用户表');
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(building), '建筑表');
                    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(_data), '数据表');
                    
                    // 3. 生成文件名（格式：年月日_时分秒.xlsx）
                    const now = new Date();
                    const filename = [
                        now.getFullYear(),
                        String(now.getMonth() + 1).padStart(2, '0'),
                        String(now.getDate()).padStart(2, '0')
                    ].join('') + '_' + [
                        String(now.getHours()).padStart(2, '0'),
                        String(now.getMinutes()).padStart(2, '0'),
                        String(now.getSeconds()).padStart(2, '0')
                    ].join('') + '.xlsx';
                    
                    // 4. 实现URL下载方式
                    const excelData = XLSX.write(wb, {
                        bookType: 'xlsx',
                        type: 'array' // 生成二进制数组
                    });
                    
                    // 创建Blob对象
                    const blob = new Blob([excelData], {
                        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    });
                    
                    // 创建下载链接
                    const url = URL.createObjectURL(blob);
                    
                    // 5. 创建并触发下载
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    
                    // 清理
                    setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url); // 释放内存
                    }, 100);
                    
                    top.showMessage("导出成功", 5000);
                } else {
                    top.showMessage(data.msg, 3000, "red");
                }
            } else {
                top.showMessage("请求失败，状态码: " + xhr.status, 3000, "red");
            }
        }
    };
    
    xhr.onerror = function() {
        top.showMessage("请求发生错误", 3000, "red");
    };
    
    xhr.send();
}

//生成一个6位随机令牌
function generateToken() {
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let t = '';
    for (let i = 0; i < 6; i++) {
        t += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return '$' + t;
}


// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);