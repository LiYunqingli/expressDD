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
    // return;
    tableBody.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('tr');
        row.id = "_" + item.id;
        row.onclick = () => {
            clickRow(`_${item.id}`);
        }
        //未送达 red
        //待分享 yellow
        //已分享 green
        let statusClass = '';
        if (item.status === '未送达') {
            statusClass = 'status_red';
        } else if (item.status === '待分享') {
            statusClass = 'status_yellow';
        } else if (item.status === '已完成') {
            statusClass = 'status_green';
        }
        row.innerHTML = `
                    <td>
                        <span>${item.create_at}</span>
                        <span class="status ${statusClass}" onclick="statusClick('${item.status}', '${item.id}')">${item.status}</span>
                    </td>
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

function clickRow(id) {
    let clickedRowTds = document.querySelectorAll(`#${id} td`);
    let building = clickedRowTds[1].innerText;
    let room = clickedRowTds[2].innerText;
    top.showMessage(`已选中 "${building} ${room}"`)
    let allRow = document.querySelectorAll("#records-table tbody tr");
    allRow.forEach((row) => {
        // console.log(row);
        //#e3f2fd
        let _building = row.querySelector('td:nth-child(2)').innerText;
        let _room = row.querySelector('td:nth-child(3)').innerText;
        if (_building == building && _room == room) {
            if (row.style.backgroundColor == '#e3f2fd' || row.style.backgroundColor == 'rgb(227, 242, 253)') {
                //去掉行内样式
                row.style.backgroundColor = '';
            } else {
                row.style.backgroundColor = '#e3f2fd';
            }
        } else {
            //去掉行内样式
            row.style.backgroundColor = '';
        }
    })
}


// 打开新增记录弹窗
function openAddModal() {
    // 重置表单
    document.getElementById('building-add').value = '';
    document.getElementById('room-add').value = '';
    // document.getElementById('pickup-code-add').value = '';
    // document.getElementById('express-number-add').value = '';
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

// 检查多条记录
function addRecordCheck() {
    let all = document.querySelectorAll("#express-groups-container .express-group");
    if (all.length == 1) {
        // 允许空记录
    } else {
        for (let i = 1; i < all.length; i++) {
            let nowEle = all[i];
            nowEle = nowEle.children[1];
            let pickupCode = nowEle.children[0].querySelector("input").value;
            let expressNumber = nowEle.children[1].querySelector("input").value;
            //如果两个都为空，则删除
            if (pickupCode == "" && expressNumber == "") {
                nowEle.parentElement.remove();
            }
        }
        //更新all
        all = document.querySelectorAll("#express-groups-container .express-group");
        //还需要检查，如果数量大于二则需要判断第一个元素
        if (all.length > 1) {
            let nowEle = all[0];
            nowEle = nowEle.children[1];
            let pickupCode = nowEle.children[0].querySelector("input").value;
            let expressNumber = nowEle.children[1].querySelector("input").value;
            //如果两个都为空，则删除
            if (pickupCode == "" && expressNumber == "") {
                nowEle.parentElement.remove();
            }
        }
        all = document.querySelectorAll("#express-groups-container .express-group");
        top.showMessage("已删除空记录");
        console.log(all);
    }
    return all;
}

// 添加新记录
function addRecord() {
    let all = addRecordCheck();
    let type;
    let codes = [];
    for (let i = 0; i < all.length; i++) {
        let nowEle = all[i];
        nowEle = nowEle.children[1];
        // 其中第一个div里面的input
        let pickupCode = nowEle.children[0].querySelector("input").value;
        let expressNumber = nowEle.children[1].querySelector("input").value;
        codes.push({
            pickupCode: pickupCode,
            expressNumber: expressNumber
        })
    }
    const newRecord = {
        token: getToken(),
        type: type,
        time: document.getElementById('pickup-time-add').value,
        building: document.querySelector('#building-add select').value,
        room: document.getElementById('room-add').value,
        codes: codes,
        notes: document.getElementById('notes-add').value
    };
    console.log(newRecord);
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

    // 在排序前，第一个-前面的数字如果不够两位数字，补0
    type_num.forEach(item => {
        const code = item.pickupCode;
        const parts = code.split('-');
        if (parts.length > 1) {
            parts[0] = parts[0].padStart(2, '0');
            item.pickupCode = parts.join('-');
        }
    })

    console.log("fdsa")
    console.log(type_num);

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

    document.getElementById("uploadImageInput").addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file && file.type.match('image.*')) {
            const reader = new FileReader();

            // 显示压缩中消息
            top.showMessage('正在压缩图片...');

            reader.onload = function (e) {

                // 创建图片对象进行压缩
                const img = new Image();
                img.onload = function () {
                    // 创建canvas进行压缩
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // 设置最大尺寸
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    // 调整尺寸（保持比例）
                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    // 修复：删除重复的canvas.height赋值
                    canvas.width = width;
                    canvas.height = height;

                    // 修复：清理重复注释，正确调用drawImage
                    ctx.drawImage(img, 0, 0, width, height);

                    // 获取压缩后的图片数据
                    canvas.toBlob(function (compressedBlob) {
                        // 更新消息
                        top.showMessage('正在上传图片...');

                        // 创建FormData并添加两个图片
                        const formData = new FormData();
                        formData.append('originalImage', file); // 原图
                        formData.append('compressedImage', compressedBlob, 'compressed_' + file.name); // 压缩图

                        // 发送到服务器
                        const xhr = new XMLHttpRequest();
                        xhr.open('POST', $HOST + '/uploadImg.php', true);
                        // 关键修复：删除下面这行错误的Content-Type设置！
                        xhr.setRequestHeader('Token', getToken());
                        xhr.setRequestHeader('ID', top.upload_image_data_id);

                        xhr.onload = function () {
                            if (xhr.status === 200) {
                                try {
                                    const response = JSON.parse(xhr.responseText);
                                    if (response.success) {
                                        top.showMessage('图片上传成功!', 3000, 'green');
                                        //获取第一个tr
                                        let now_data_item = document.querySelector("#_" + top.upload_image_data_id + " td:first-child span:nth-child(2)");
                                        console.log(now_data_item);
                                        //去掉这个元素的class，status_red，改为status_yellow
                                        now_data_item.classList.remove('status_red');
                                        now_data_item.classList.add('status_yellow');
                                        now_data_item.innerHTML = "待分享";
                                        //onclick改
                                        now_data_item.setAttribute("onclick", "statusClick('待分享', '" + top.upload_image_data_id + "')");
                                        //将top.data中的对应id的status改为"待分享"
                                        for (let i = 0; i < top.data.length; i++) {
                                            let now_data = top.data[i];
                                            if (now_data.id == top.upload_image_data_id) {
                                                top.data[i].status = "待分享";
                                            }
                                        }
                                    } else {
                                        top.showMessage('上传失败: ' + response.message, 3000, 'red');
                                    }
                                } catch (e) {
                                    top.showMessage('服务器响应异常', 3000, 'red');
                                }
                            } else {
                                top.showMessage('上传失败，状态码: ' + xhr.status, 3000, 'red');
                            }
                        };

                        xhr.onerror = function () {
                            top.showMessage('上传发生错误', 3000, 'red');
                        };

                        xhr.send(formData); // 发送FormData（浏览器自动加正确的Content-Type）

                    }, 'image/jpeg', 0.7); // 压缩质量70%
                };
                img.src = e.target.result; // 加载原图用于压缩
            };

            reader.readAsDataURL(file); // 读取文件用于预览
        } else {
            top.showMessage('请拍照或者选择图片文件', 3000, 'red');
        }
    });

}

// 导出所有数据到xlsx（支持URL下载）
function exportData() {

    confirmDialog.show({
        title: "确认开始下载备份吗？",
        message: "确认后将下载xlsx文件，请确保浏览器允许下载。",
        onConfirm: () => {
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

            xhr.onerror = function () {
                top.showMessage("请求发生错误", 3000, "red");
            };

            xhr.send();
        },
        onCancel: () => {
            console.log("删除操作已取消");
        }
    });
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


// 增加数据（多条数据多组数据插入）
document.addEventListener('DOMContentLoaded', function () {
    let groupCount = 1;
    const container = document.getElementById('express-groups-container');

    // 添加新组
    document.getElementById('add-group-btn').addEventListener('click', function () {
        groupCount++;
        const newGroup = document.createElement('div');
        newGroup.className = 'express-group';
        newGroup.style = `
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    padding: 10px;
                    margin-bottom: 10px;
                    background: #f9f9f9;
                `;

        newGroup.innerHTML = `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="font-weight: bold; color: #3498db;">包裹 #${groupCount}</span>
                        <button class="remove-group-btn" style="
                            background: #e74c3c;
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 24px;
                            height: 24px;
                            cursor: pointer;
                        ">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>取件码</label>
                            <input type="text" placeholder="例如：A1234" name="pickup-code">
                        </div>
                        <div class="form-group" style="margin-bottom: 0;">
                            <label>快递尾号</label>
                            <input type="number" placeholder="例如：5678" name="express-number">
                        </div>
                    </div>
                `;

        container.appendChild(newGroup);

        // 启用第一组的删除按钮
        if (groupCount > 1) {
            document.querySelector('.express-group:first-child .remove-group-btn').disabled = false;
        }

        // 绑定删除事件
        newGroup.querySelector('.remove-group-btn').addEventListener('click', function () {
            newGroup.remove();
            groupCount--;

            // 更新序号
            document.querySelectorAll('.express-group').forEach((group, index) => {
                group.querySelector('span').textContent = `包裹 #${index + 1}`;
            });

            // 如果只剩一组，禁用删除按钮
            if (groupCount === 1) {
                document.querySelector('.express-group:first-child .remove-group-btn').disabled = true;
            }
        });
    });
});

// 筛选数据
function selectData(no) {
    const trs = document.querySelectorAll('#records-table tbody tr');
    let types = [];
    trs.forEach(tr => {
        let type = tr.querySelector(`td:nth-child(${no})`).innerText;
        if (!types.includes(type)) {
            types.push(type);
        }
    });
    console.log(types);
    // let options = [{text:'text1',selected:false},{text:'text2',selected:false}];
    let options = types.map(type => {
        return { text: type, selected: false };
    });
    radioList.show('选择需要筛选的栋', options, (selected) => {
        top.showMessage("点击了" + selected.text);
        delNotSelectData(selected.text, no);
    });
}

function delNotSelectData(selectDataText, no) {
    const trs = document.querySelectorAll('#records-table tbody tr');
    trs.forEach(tr => {
        let type = tr.querySelector(`td:nth-child(${no})`).innerText;
        if (type != selectDataText) {
            tr.remove();
        }
    });
}

// 点击状态按钮，不同状态执行不同的操作
function statusClick(status, id) {
    //阻止其他click事件
    event.stopPropagation();
    if (status == "未送达") {
        // top.showMessage("点击了未送达");
        top.upload_image_data_id = id;
        document.getElementById("uploadImageInput").click();
    } else if (status == "待分享") {
        // top.showMessage("点击了待分享");
        // let xhr = new XMLHttpRequest();
        // xhr.open("GET", $HOST + "/getImgDetail.php?pid=" + id, true);
        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState == 4 && xhr.status == 200) {
        //         let result = JSON.parse(xhr.responseText);
        //         if(result.code == 200){
        //             console.log(result.data);
        //             let shareURL = $HOST + "/uploads/" + result.data[0].compressed;
        //             //将图片地址复制到剪贴板
        //             navigator.clipboard.writeText(shareURL).then(function() {
        //                 top.showMessage("图片地址已复制到剪贴板", 3000, "green");
        //             })
        //             //新建标签页跳转
        //             // window.open(shareURL, '_blank');
        //         }else{
        //             top.showMessage(result.msg, 3000, "red");
        //         }
        //     }
        // }
        // xhr.send();
        // let shareURL = $MAIN + "/detail/share.html?pid=" + id;
        // //将图片地址复制到剪贴板
        // navigator.clipboard.writeText(shareURL).then(function() {
        //     top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
        // })
        // 修改后的代码 - 添加兼容性处理
        let shareURL = $MAIN + "/detail/share.html?pid=" + id;

        function copyToClipboard() {
            // 优先尝试 Android 接口
            if (window.AndroidClipboard && typeof AndroidClipboard.copyText === 'function') {
                AndroidClipboard.copyText(shareURL);
                top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
            }
            // 其次尝试标准剪贴板 API
            else if (navigator.clipboard) {
                navigator.clipboard.writeText(shareURL).then(function () {
                    top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
                }).catch(function () {
                    fallbackCopy(shareURL);
                });
            }
            // 最后使用兼容性方案
            else {
                fallbackCopy(shareURL);
            }
        }

        function fallbackCopy(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();

            try {
                const successful = document.execCommand('copy');
                if (successful) {
                    top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
                } else {
                    top.showMessage("复制失败，请手动复制", 3000, "red");
                }
            } catch (err) {
                top.showMessage("无法复制: " + err, 3000, "red");
            } finally {
                document.body.removeChild(textArea);
            }
        }

        // 调用复制函数
        copyToClipboard();
    } else if (status == "已完成") {
        top.showMessage("");
    } else {
        top.showMessage("内部数据库错误：数据中状态类型不包含'" + status + "'", 6000, "red");
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);