// 全局的数据
top.data = []
top.pricePublishSetting = false;

// 全局的数据最新时间
top.dataLastUpdateTime = "none"; // 初次使用none，获取当天的全部数据

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

let priceEditor = null;
let shareNewPriceEditor = null;

// 当前活动标签
let activeTab = 'deliver';
// 当前编辑的记录ID
let currentEditId = null;
// 渲染表格数据
function renderTable(data, style = '') {
    // return;
    tableBody.innerHTML = '';

    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

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
        const notesText = escapeHtml(item.notes || '');
        const notesImg = item.notes_img || '';
        let notesCellHtml = `<span class="notes-text">${notesText}</span>`;
        if (notesImg) {
            const url = $HOST + '/uploads_notes/' + encodeURIComponent(notesImg);
            notesCellHtml = `
                <div class="notes-cell">
                    <span class="notes-text">${notesText}</span>
                    <img
                        class="notes-thumb"
                        src="${url}"
                        alt="备注图片"
                        loading="lazy"
                        data-notes-url="${url}"
                    >
                </div>
            `;
        }

        const priceText = formatPriceDisplay(item.price);
        const priceClass = priceText === '--' ? 'price-cell empty' : 'price-cell';

        row.innerHTML = `
                    <td>
                        <span>${item.create_at}</span>
                        <span class="status ${statusClass}" onclick="statusClick('${item.status}', '${item.id}')">${item.status}</span>
                    </td>
                    <td class="${priceClass}" data-role="price-cell" data-id="${item.id}">${priceText}</td>
                    <td>${item.building}</td>
                    <td>${item.room}</td>
                    <td>${item.pickupCode}</td>
                    <td>${item.expressNumber}</td>
                    <td>${notesCellHtml}</td>
                    <td>${item.building_users_id}</td>
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

// Notes image preview modal
function openNotesImage(url) {
    const modal = document.getElementById('notes-img-modal');
    const img = document.getElementById('notes-img-modal-img');
    if (!modal || !img) return;
    img.src = url;
    modal.style.display = 'flex';
}

function closeNotesImage() {
    const modal = document.getElementById('notes-img-modal');
    const img = document.getElementById('notes-img-modal-img');
    if (img) img.src = '';
    if (modal) modal.style.display = 'none';
}

// intercept thumbnail click before row onclick
tableBody.addEventListener('click', function (e) {
    const t = e.target;
    if (t && t.classList && t.classList.contains('notes-thumb')) {
        e.stopPropagation();
        const url = t.getAttribute('data-notes-url') || '';
        if (url) openNotesImage(url);
        return;
    }

    const priceCell = t && t.closest ? t.closest('[data-role="price-cell"]') : null;
    if (priceCell) {
        e.stopPropagation();
        const id = priceCell.getAttribute('data-id');
        if (id) {
            openPriceEditor(id);
        }
    }
}, true);

function clickRow(id) {
    let clickedRowTds = document.querySelectorAll(`#${id} td`);
    let building = clickedRowTds[2].innerText;
    let room = clickedRowTds[3].innerText;
    // top.showMessage(`已选中 "${building} ${room}"`)
    let allRow = document.querySelectorAll("#records-table tbody tr");
    let count = 0;
    allRow.forEach((row) => {
        // console.log(row);
        //#e3f2fd
        let _building = row.querySelector('td:nth-child(3)').innerText;
        let _room = row.querySelector('td:nth-child(4)').innerText;
        if (_building == building && _room == room) {
            if (row.style.backgroundColor == '#e3f2fd' || row.style.backgroundColor == 'rgb(227, 242, 253)') {
                //去掉行内样式
                row.style.backgroundColor = '';

            } else {
                row.style.backgroundColor = '#e3f2fd';
                count++;
            }
        } else {
            //去掉行内样式
            row.style.backgroundColor = '';
        }
    });
    if (count <= 0) {
        top.showMessage(`已取消选择 "${building} ${room}"`);
    } else {
        top.showMessage(`已选中 "${building} ${room}"，共 ${count} 单`)
    }
}


// 打开新增记录弹窗
function openAddModal() {
    // 重置表单
    document.getElementById('building-add').value = '';
    document.getElementById('room-add').value = '';
    // document.getElementById('pickup-code-add').value = '';
    // document.getElementById('express-number-add').value = '';
    document.getElementById('notes-add').value = '';

    // reset remark image
    const fileInput = document.getElementById('notes-img-add');
    const preview = document.getElementById('notes-img-preview-add');
    const removeBtn = document.getElementById('notes-img-remove-btn');
    const filenameEl = document.getElementById('notes-img-filename');
    if (fileInput) fileInput.value = '';
    if (preview) {
        preview.src = '';
        preview.style.display = 'none';
    }
    if (removeBtn) removeBtn.style.display = 'none';
    if (filenameEl) filenameEl.textContent = '';

    addModal.style.display = 'flex';
}

// 打开修改记录弹窗
function openEditModal(id) {
    const record = top.data.find(item => item.id === id);
    if (!record) return;

    currentEditId = id;

    // 填充表单
    document.getElementById('id-edit').value = record.id;
    document.getElementById('building-edit-select').value = record.building;
    document.getElementById('room-edit').value = record.room;
    document.getElementById('pickup-code-edit').value = record.pickupCode;
    document.getElementById('express-number-edit').value = record.expressNumber;
    document.getElementById('price-edit').value = normalizePriceValue(record.price) || '';
    document.getElementById('notes-edit').value = record.notes;
    document.getElementById('pickup-time-edit').value = record.time;

    editModal.style.display = 'flex';
    return record;
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
    if (!checkKeHuisSelect()) {
        top.showMessage("请选择微信名！", 3000, 'red');
        return;
    }
    top.showLoading("增加新记录...");
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
    let KeHuAdd = document.getElementById("kehu-add").value;
    const notesText = document.getElementById('notes-add').value;
    const fileInput = document.getElementById('notes-img-add');
    const file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;

    function sendAddRequest(notesImgFilename = '') {
        const newRecord = {
            token: getToken(),
            type: type,
            time: document.getElementById('pickup-time-add').value,
            building: document.querySelector('#building-add select').value,
            room: document.getElementById('room-add').value,
            codes: codes,
            notes: notesText,
            notes_img: notesImgFilename,
            building_users_id: KeHuAdd
        };
        console.log(newRecord);

        let xhr = new XMLHttpRequest();
        xhr.open("POST", $HOST + "/addData.php", true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
                top.closeLoading();
                let result = JSON.parse(xhr.responseText);
                if (result.code == 200) {
                    getData();
                    resetToDefault();//重置快递包裹条目为1，更新索引排序
                    closeModal();
                    top.showMessage(result.msg);
                } else {
                    top.showMessage(result.msg, 3000, "red");
                }
            }
        };
        xhr.send(JSON.stringify(newRecord));
    }

    if (!file) {
        sendAddRequest('');
        return;
    }

    // Upload remark image first, then add data
    const fd = new FormData();
    fd.append('image', file);
    let up = new XMLHttpRequest();
    up.open('POST', $HOST + '/uploadNoteImg.php', true);
    up.setRequestHeader('token', getToken());
    up.onreadystatechange = function () {
        if (up.readyState === 4) {
            if (up.status !== 200) {
                top.closeLoading();
                top.showMessage('备注图片上传失败', 3000, 'red');
                return;
            }
            let res = {};
            try {
                res = JSON.parse(up.responseText);
            } catch (e) {
                top.closeLoading();
                top.showMessage('备注图片上传返回异常', 3000, 'red');
                return;
            }
            if (res.code === 200 && res.data && res.data.filename) {
                sendAddRequest(res.data.filename);
            } else {
                top.closeLoading();
                top.showMessage(res.msg || '备注图片上传失败', 3000, 'red');
            }
        }
    };
    up.send(fd);
}

// remark image controls (add modal)
window.addEventListener('DOMContentLoaded', function () {
    const chooseBtn = document.getElementById('notes-img-choose-btn');
    const removeBtn = document.getElementById('notes-img-remove-btn');
    const fileInput = document.getElementById('notes-img-add');
    const preview = document.getElementById('notes-img-preview-add');
    const filenameEl = document.getElementById('notes-img-filename');

    if (chooseBtn && fileInput) {
        chooseBtn.addEventListener('click', function () {
            fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', function () {
            const file = fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
            if (!file) return;
            if (filenameEl) filenameEl.textContent = file.name;
            if (removeBtn) removeBtn.style.display = 'inline-block';
            if (preview) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
            }
        });
    }

    if (removeBtn && fileInput) {
        removeBtn.addEventListener('click', function () {
            fileInput.value = '';
            if (filenameEl) filenameEl.textContent = '';
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }
            removeBtn.style.display = 'none';
        });
    }

    // notes image modal: prevent inner click closing
    const notesModalContent = document.querySelector('.notes-img-modal-content');
    if (notesModalContent) {
        notesModalContent.addEventListener('click', function (evt) {
            evt.stopPropagation();
        });
    }
});

// 更新记录
function updateRecord() {
    if (!checkKeHuisSelect("edit")) {
        top.showMessage("微信名不得为空！", 3000, 'red');
        return;
    }
    const record = top.data.find(item => item.id === currentEditId);
    if (record) {
        record.token = getToken();
        record.time = document.getElementById('pickup-time-edit').value;
        record.building = document.getElementById('building-edit-select').value;
        record.room = document.getElementById('room-edit').value;
        record.pickupCode = document.getElementById('pickup-code-edit').value;
        record.expressNumber = document.getElementById('express-number-edit').value;
        const editPriceRaw = document.getElementById('price-edit').value;
        const editPrice = sanitizePriceInput(editPriceRaw);
        if (String(editPriceRaw).trim() !== '' && !editPrice) {
            top.showMessage('价格格式错误，请输入大于等于 0 的数字（最多两位小数）', 3000, 'red');
            return;
        }
        record.price = editPrice;
        record.notes = document.getElementById('notes-edit').value;
        record.building_users_id = document.getElementById('kehu-edit').value;

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
            // building-edit-select
            document.getElementById("building-add").innerHTML = "<select>" + shuchu + "</select>";
            document.getElementById("building-edit-select").innerHTML = shuchu;

            document.querySelector("#building-add select").addEventListener("change", function () {
                console.log("change");
                if (this.value != "null") {
                    let b = document.getElementById("room-add").value;
                    if (b != null && b != "" && b != undefined) {
                        searchAllRoomUserWeChatName();
                    } else {
                        console.log("不符合查找房间名的条件");
                        clearFormKeHuAdd();
                    }
                } else {
                    console.log("不符合查找微信名的条件");
                    clearFormKeHuAdd();
                }
            });
            document.getElementById("room-add").addEventListener("change", function () {
                console.log("change");
                if (this.value != "" && this.value != null && this.value != undefined) {
                    let b = document.querySelector("#building-add select").value;
                    if (b != "null") {
                        searchAllRoomUserWeChatName();
                    } else {
                        console.log("不符合查找房间名的条件");
                        clearFormKeHuAdd();
                    }
                } else {
                    console.log("不符合查找房间名的条件");
                    clearFormKeHuAdd();
                }
            });

            // building-edit-select
            document.querySelector("#building-edit-select").addEventListener("change", function () {
                console.log("edit select change");
                if (this.value != "null") {
                    let b = document.getElementById("room-edit").value;
                    if (b != null && b != "" && b != undefined) {
                        searchAllRoomUserWeChatName(0, "", "edit");
                    } else {
                        console.log("不符合查找房间名的条件");
                        clearFormKeHuAdd("edit");
                    }
                } else {
                    console.log("不符合查找微信名的条件");
                    clearFormKeHuAdd("edit");
                }
            });
            document.getElementById("room-edit").addEventListener("change", function () {
                console.log("edit room change");
                if (this.value != "" && this.value != null && this.value != undefined) {
                    let b = document.querySelector("#building-edit-select").value;
                    if (b != "null") {
                        searchAllRoomUserWeChatName(0, "", "edit");
                    } else {
                        console.log("不符合查找房间名的条件");
                        clearFormKeHuAdd("edit");
                    }
                } else {
                    console.log("不符合查找房间名的条件");
                    clearFormKeHuAdd("edit");
                }
            });
        }
    }
    xhr.send();
}

function song() {

    top.shaixuanPanduan = false; // 目前是否使用了筛选功能

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

    top.shaixuanPanduan = false; // 目前是否使用了筛选功能

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
                // renderTable(top.data);
                document.querySelector('.active').click()
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

function renderPricePublishButton() {
    const btn = document.getElementById('setPricePublicBtn');
    if (!btn) return;
    if (top.pricePublishSetting) {
        btn.classList.add('public-on');
        btn.classList.remove('public-off');
        btn.innerHTML = '<i class="fas fa-eye"></i> 价格已公开';
    } else {
        btn.classList.add('public-off');
        btn.classList.remove('public-on');
        btn.innerHTML = '<i class="fas fa-eye-slash"></i> 价格未公开';
    }
}

function loadPricePublishSetting(date) {
    if (!date) return;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getPricePublishSetting.php?token=' + encodeURIComponent(getToken()) + '&date=' + encodeURIComponent(date), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = null;
            try {
                result = JSON.parse(xhr.responseText);
            } catch (e) {
                return;
            }
            if (result.code === 200) {
                top.pricePublishSetting = !!result.isPublic;
                renderPricePublishButton();
            }
        }
    };
    xhr.send();
}

function togglePricePublishSetting() {
    const nextValue = top.pricePublishSetting ? 0 : 1;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', $HOST + '/setPricePublishSetting.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = null;
            try {
                result = JSON.parse(xhr.responseText);
            } catch (e) {
                top.showMessage('公开状态更新失败', 3000, 'red');
                return;
            }
            if (result.code === 200) {
                top.pricePublishSetting = !!result.isPublic;
                renderPricePublishButton();
                top.showMessage(result.msg);
            } else {
                top.showMessage(result.msg || '公开状态更新失败', 3000, 'red');
            }
        }
    };
    xhr.send('token=' + encodeURIComponent(getToken()) + '&date=' + encodeURIComponent(dateSelect.value) + '&isPublic=' + encodeURIComponent(nextValue));
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
    initPriceEditor();
    initShareNewPriceEditor();
    setToday();
    loadPricePublishSetting(dateSelect.value);
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
        loadPricePublishSetting(dateSelect.value);
        getData();//更新数据
    });

    // 编辑和删除按钮事件委托
    tableBody.addEventListener('click', (e) => {
        if (e.target.closest('.edit')) {
            const id = e.target.closest('.edit').dataset.id;
            let building_users_id = openEditModal(id).building_users_id;
            let wechatName = building_users_id.split(":")[building_users_id.split(":").length - 1].trim();
            searchAllRoomUserWeChatName(1, wechatName, "edit");
        } else if (e.target.closest('.delete')) {
            const id = e.target.closest('.delete').dataset.id;
            deleteRecord(id);
        }
    });
    setTotalNum();

    document.getElementById("uploadImageInput").addEventListener('change', function (event) {
        const file = event.target.files[0];

        if (file && file.type.match('image.*')) {

            // 加载动画
            top.showLoading("正在压缩图片...");

            const reader = new FileReader();

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
                        top.showLoading('正在上传图片...');

                        // 创建FormData并添加两个图片
                        const formData = new FormData();
                        // formData.append('originalImage', file); // 原图
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
                                    top.closeLoading();
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
                                        // window.location.reload();
                                        // $$$
                                        getData();
                                    } else {
                                        top.showMessage('上传失败: ' + response.message, 3000, 'red');
                                    }
                                } catch (e) {
                                    top.showMessage('服务器响应异常', 3000, 'red');
                                    top.closeLoading();
                                }
                            } else {
                                top.showMessage('上传失败，状态码: ' + xhr.status, 3000, 'red');
                                top.closeLoading();
                            }
                        };

                        xhr.onerror = function () {
                            top.showMessage('上传发生错误', 3000, 'red');
                            top.closeLoading();
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

    // 在已有的modal事件监听后面添加
    document.getElementById('share-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('share-modal')) {
            closeShareModal();
        }
    });

}

function buildPriceOptions() {
    const options = [];
    for (let i = 0; i <= 50; i++) {
        const val = (i / 10).toFixed(1);
        options.push(val);
    }
    return options;
}

function normalizePriceValue(raw) {
    if (raw === null || raw === undefined) return '';
    const str = String(raw).trim();
    if (!str) return '';
    if (!/^\d+(\.\d{1,2})?$/.test(str)) return '';
    const num = Number(str);
    if (!Number.isFinite(num) || num < 0) return '';
    return num.toFixed(2);
}

function sanitizePriceInput(raw) {
    const normalized = normalizePriceValue(raw);
    return normalized || '';
}

function toRangeOptionValue(raw) {
    const normalized = normalizePriceValue(raw);
    if (!normalized) return '';
    const num = Number(normalized);
    if (!Number.isFinite(num) || num < 0 || num > 5) return '';
    const tenth = Math.round(num * 10);
    if (Math.abs(num * 10 - tenth) > 1e-6) return '';
    return (tenth / 10).toFixed(1);
}

function formatPriceDisplay(raw) {
    const normalized = normalizePriceValue(raw);
    return normalized ? `￥${normalized}` : '--';
}

function formatPricePlain(raw) {
    const normalized = normalizePriceValue(raw);
    return normalized ? normalized : '--';
}

function initPriceEditor() {
    if (priceEditor) return;
    const options = buildPriceOptions();
    const optionHtml = options.map(v => `<option value="${v}">￥${v}</option>`).join('');
    const html = `
        <div class="price-editor-overlay" id="price-editor-overlay">
            <div class="price-editor-card" onclick="event.stopPropagation()">
                <div class="price-editor-header">设置价格</div>
                <div class="price-editor-body">
                    <div class="hint">支持快速滑动、下拉选择或自定义输入</div>
                    <input type="range" id="price-editor-range" min="0.0" max="5.0" step="0.1" value="0.0">
                    <select id="price-editor-select">${optionHtml}<option value="custom">自定义输入</option></select>
                    <input type="number" id="price-editor-custom" min="0" step="0.01" placeholder="自定义价格（>= 0，最多两位小数）" style="display:none;">
                </div>
                <div class="price-editor-footer">
                    <button class="btn btn-danger" id="price-editor-cancel">取消</button>
                    <button class="btn btn-success" id="price-editor-save">保存</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    const overlay = document.getElementById('price-editor-overlay');
    const range = document.getElementById('price-editor-range');
    const select = document.getElementById('price-editor-select');
    const custom = document.getElementById('price-editor-custom');
    const cancel = document.getElementById('price-editor-cancel');
    const save = document.getElementById('price-editor-save');

    const syncFromRange = () => {
        const value = Number(range.value).toFixed(1);
        select.value = value;
        custom.style.display = 'none';
        custom.value = '';
    };

    const syncFromSelect = () => {
        if (select.value === 'custom') {
            custom.style.display = 'block';
            custom.focus();
            return;
        }
        custom.style.display = 'none';
        custom.value = '';
        range.value = select.value;
    };

    range.addEventListener('input', syncFromRange);
    select.addEventListener('change', syncFromSelect);

    overlay.addEventListener('click', () => closePriceEditor());
    cancel.addEventListener('click', () => closePriceEditor());
    save.addEventListener('click', () => savePriceEditor());

    priceEditor = {
        overlay,
        range,
        select,
        custom,
        targetId: null,
        targetField: 'price',
        onSaved: null,
        silent: false
    };
}

function openPriceEditor(id, field = 'price', options = {}) {
    const record = top.data.find(item => String(item.id) === String(id));
    if (!record) {
        top.showMessage('未找到对应记录', 3000, 'red');
        return;
    }

    const currentRaw = field === 'new_price'
        ? (normalizePriceValue(record.new_price) ? record.new_price : record.price)
        : record.price;
    const value = normalizePriceValue(currentRaw) || '0.00';
    const rangeValue = toRangeOptionValue(value);
    priceEditor.targetId = String(id);
    priceEditor.targetField = field === 'new_price' ? 'new_price' : 'price';
    priceEditor.onSaved = typeof options.onSaved === 'function' ? options.onSaved : null;
    priceEditor.silent = !!options.silent;
    if (rangeValue) {
        priceEditor.range.value = rangeValue;
        priceEditor.select.value = rangeValue;
        priceEditor.custom.style.display = 'none';
        priceEditor.custom.value = '';
    } else {
        priceEditor.range.value = '0.0';
        priceEditor.select.value = 'custom';
        priceEditor.custom.style.display = 'block';
        priceEditor.custom.value = value;
    }
    priceEditor.overlay.classList.add('show');
}

function closePriceEditor() {
    if (!priceEditor) return;
    priceEditor.overlay.classList.remove('show');
    priceEditor.targetId = null;
    priceEditor.targetField = 'price';
    priceEditor.onSaved = null;
    priceEditor.silent = false;
}

function savePriceEditor() {
    if (!priceEditor || !priceEditor.targetId) return;

    let value = '';
    if (priceEditor.select.value === 'custom') {
        value = sanitizePriceInput(priceEditor.custom.value);
        if (!value) {
            top.showMessage('请输入大于等于 0 的价格（最多两位小数）', 3000, 'red');
            return;
        }
    } else {
        value = sanitizePriceInput(priceEditor.select.value || priceEditor.range.value);
    }

    if (!value) {
        top.showMessage('价格格式无效', 3000, 'red');
        return;
    }

    updatePriceOnly(priceEditor.targetId, value, priceEditor.targetField, priceEditor.onSaved, { silent: priceEditor.silent });
}

function updatePriceOnly(id, price, field = 'price', onSuccess = null, options = {}) {
    const safeField = field === 'new_price' ? 'new_price' : 'price';
    const silent = !!(options && options.silent);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', $HOST + '/setDataPrice.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let result = null;
            try {
                result = JSON.parse(xhr.responseText);
            } catch (e) {
                top.showMessage('价格更新失败：响应格式错误', 3000, 'red');
                return;
            }

            if (xhr.status === 200 && result.code === 200) {
                const target = top.data.find(item => String(item.id) === String(id));
                if (target) {
                    target[safeField] = price;
                }

                if (safeField === 'price') {
                    const row = document.getElementById('_' + id);
                    if (row) {
                        const cell = row.querySelector('[data-role="price-cell"]');
                        if (cell) {
                            cell.textContent = formatPriceDisplay(price);
                            cell.classList.remove('empty');
                        }
                    }
                }

                if (!silent) {
                    top.showMessage(result.msg || '价格更新成功');
                }
                closePriceEditor();
                if (typeof onSuccess === 'function') {
                    onSuccess(price, safeField);
                }
            } else {
                top.showMessage((result && result.msg) ? result.msg : '价格更新失败', 3000, 'red');
            }
        }
    };
    xhr.send(`token=${encodeURIComponent(getToken())}&id=${encodeURIComponent(id)}&price=${encodeURIComponent(price)}&field=${encodeURIComponent(safeField)}`);
}

function renderSharePriceSummary(list, totals, currentId) {
    const body = document.getElementById('share-price-list-body');
    const grandTotalEl = document.getElementById('share-price-grand-total');
    if (!body || !grandTotalEl) return;

    body.innerHTML = '';
    if (!Array.isArray(list) || list.length === 0) {
        body.innerHTML = '<tr><td colspan="4" style="text-align:center;">暂无数据</td></tr>';
        grandTotalEl.textContent = '--';
        return;
    }

    list.forEach(item => {
        const tr = document.createElement('tr');
        if (String(item.id) === String(currentId)) {
            tr.classList.add('current-row');
        }
        tr.innerHTML = `
            <td>${item.pickupCode || '--'}</td>
            <td class="editable-price" data-edit-field="price" data-id="${item.id}">${formatPricePlain(item.price)}</td>
            <td class="editable-price" data-edit-field="new_price" data-id="${item.id}">${formatPricePlain(item.new_price)}</td>
            <td>${formatPricePlain(item.avg)}</td>
        `;
        body.appendChild(tr);
    });

    const avgTotal = list.reduce((sum, item) => {
        const avg = Number(normalizePriceValue(item.avg) || 0);
        return sum + avg;
    }, 0);
    grandTotalEl.textContent = `￥${avgTotal.toFixed(2)}`;
}

function loadSharePriceSummary(pid) {
    if (!pid) return;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getUserDayPriceList.php?token=' + encodeURIComponent(getToken()) + '&pid=' + encodeURIComponent(pid), true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = null;
            try {
                result = JSON.parse(xhr.responseText);
            } catch (e) {
                return;
            }
            if (result.code === 200) {
                renderSharePriceSummary(result.data || [], {
                    totalPrice: result.totalPrice,
                    totalNewPrice: result.totalNewPrice,
                    grandTotal: result.grandTotal
                }, pid);
            } else {
                renderSharePriceSummary([], {}, pid);
            }
        }
    };
    xhr.send();
}

function initShareNewPriceEditor() {
    if (shareNewPriceEditor) return;

    const range = document.getElementById('share-new-price-range');
    const select = document.getElementById('share-new-price-select');
    const custom = document.getElementById('share-new-price-custom');
    if (!range || !select || !custom) return;

    const options = buildPriceOptions();
    select.innerHTML = options.map(v => `<option value="${v}">￥${v}</option>`).join('') + '<option value="custom">自定义输入</option>';

    const syncFromRange = () => {
        const value = Number(range.value).toFixed(1);
        select.value = value;
        custom.style.display = 'none';
        custom.value = '';
    };

    const syncFromSelect = () => {
        if (select.value === 'custom') {
            custom.style.display = 'inline-block';
            custom.focus();
            return;
        }
        custom.style.display = 'none';
        custom.value = '';
        range.value = select.value;
    };

    range.addEventListener('input', syncFromRange);
    select.addEventListener('change', syncFromSelect);

    shareNewPriceEditor = {
        range,
        select,
        custom,
        syncFromRange,
        syncFromSelect
    };
}

function setShareNewPriceEditorValue(raw, fallbackRaw = '') {
    if (!shareNewPriceEditor) return;
    const value = normalizePriceValue(raw) || normalizePriceValue(fallbackRaw) || '0.00';
    const rangeValue = toRangeOptionValue(value);
    if (rangeValue) {
        shareNewPriceEditor.range.value = rangeValue;
        shareNewPriceEditor.select.value = rangeValue;
        shareNewPriceEditor.custom.style.display = 'none';
        shareNewPriceEditor.custom.value = '';
    } else {
        shareNewPriceEditor.range.value = '0.0';
        shareNewPriceEditor.select.value = 'custom';
        shareNewPriceEditor.custom.style.display = 'inline-block';
        shareNewPriceEditor.custom.value = value;
    }
}

function getShareNewPriceEditorValue() {
    if (!shareNewPriceEditor) return '';
    if (shareNewPriceEditor.select.value === 'custom') {
        const customValue = sanitizePriceInput(shareNewPriceEditor.custom.value);
        if (!customValue) {
            return '__INVALID_CUSTOM__';
        }
        return customValue;
    }
    return sanitizePriceInput(shareNewPriceEditor.select.value || shareNewPriceEditor.range.value);
}

document.addEventListener('click', function (evt) {
    const target = evt.target;
    if (!target || !target.closest) return;
    const editableCell = target.closest('#share-price-list-body .editable-price');
    if (!editableCell) return;
    const id = editableCell.getAttribute('data-id');
    const field = editableCell.getAttribute('data-edit-field') || 'price';
    if (!id) return;
    openPriceEditor(id, field, {
        onSaved: function () {
            loadSharePriceSummary(top.upload_image_data_id);
            const currentRecord = top.data.find(item => String(item.id) === String(top.upload_image_data_id));
            if (currentRecord) {
                setShareNewPriceEditorValue(currentRecord.new_price, currentRecord.price);
            }
        }
    });
});

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


// 全局变量，确保所有函数都能访问到
let groupCount = 1;
const container = document.getElementById('express-groups-container');
let initialGroupHTML;

document.addEventListener('DOMContentLoaded', function () {
    // 保存初始状态（页面加载时的第一组数据）
    const initialGroup = document.querySelector('.express-group');
    if (initialGroup) {
        initialGroupHTML = initialGroup.outerHTML;
    }

    // 添加新组
    document.getElementById('add-group-btn').addEventListener('click', function () {
        groupCount++; // 递增计数器，确保从2开始
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
            updateGroupNumbers();

            // 如果只剩一组，禁用删除按钮
            if (groupCount === 1) {
                document.querySelector('.express-group:first-child .remove-group-btn').disabled = true;
            }
        });
    });
});

// 复原到默认状态的函数（仅定义，未绑定到任何监听器）
function resetToDefault() {
    // 获取所有组元素
    const allGroups = container.querySelectorAll('.express-group');

    // 只保留第一组，删除其他组
    if (allGroups.length > 1) {
        for (let i = 1; i < allGroups.length; i++) {
            allGroups[i].remove();
        }
    }

    // 重置计数器为1，确保下次新增从2开始
    groupCount = 1;

    // 更新序号为#1
    const firstGroup = container.querySelector('.express-group');
    if (firstGroup) {
        firstGroup.querySelector('span').textContent = `包裹 #1`;

        // 禁用第一组的删除按钮
        const removeBtn = firstGroup.querySelector('.remove-group-btn');
        if (removeBtn) {
            removeBtn.disabled = true;

            // 重新绑定删除事件
            removeBtn.addEventListener('click', function () {
                const currentGroups = document.querySelectorAll('.express-group');
                if (currentGroups.length > 1) {
                    this.closest('.express-group').remove();
                    groupCount--;
                    updateGroupNumbers();

                    if (document.querySelectorAll('.express-group').length === 1) {
                        document.querySelector('.express-group:first-child .remove-group-btn').disabled = true;
                    }
                }
            });
        }

        // 清空第一组的输入框内容
        firstGroup.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
    }
}

// 更新序号的功能函数
function updateGroupNumbers() {
    document.querySelectorAll('.express-group').forEach((group, index) => {
        group.querySelector('span').textContent = `包裹 #${index + 1}`;
    });
}


// 筛选数据
function selectData(columnNo) {
    const trs = document.querySelectorAll('#records-table tbody tr');
    let typeCounts = {};

    // 统计每种类型的数量
    trs.forEach(tr => {
        let type = tr.querySelector(`td:nth-child(${columnNo})`).innerText.trim();
        if (type) {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        }
    });

    // 创建选项数组
    let options = Object.keys(typeCounts).map(type => {
        return {
            text: type,
            value: type,
            count: typeCounts[type],
            selected: true  // 默认全部选中，但会被记忆状态覆盖
        };
    });

    // 设置列键，用于记忆选择状态
    selectList.setColumnKey(`column_${columnNo}`);

    // 显示筛选列表
    selectList.show('选择需要筛选的类型', options, (selectedOptions) => {
        // 获取所有选中的值
        const selectedValues = selectedOptions.map(opt => opt.value);

        // 显示或隐藏表格行
        trs.forEach(tr => {
            let type = tr.querySelector(`td:nth-child(${columnNo})`).innerText.trim();
            if (selectedValues.includes(type)) {
                tr.style.display = ''; // 显示匹配的行
            } else {
                tr.style.display = 'none'; // 隐藏不匹配的行
            }
        });

        // 显示提示信息
        const selectedCount = selectedOptions.length;
        const totalCount = options.length;

        if (selectedCount === totalCount) {
            top.showMessage("已显示所有类型");
        } else if (selectedCount === 0) {
            top.showMessage("已隐藏所有类型");
        } else {
            top.showMessage(`已选择 ${selectedCount}/${totalCount} 种类型`);
        }
    });
}

// 点击状态按钮，不同状态执行不同的操作
function statusClick(status, id) {
    //阻止其他click事件
    event.stopPropagation();
    top.upload_image_data_id = id;
    if (status == "未送达") {
        // top.showMessage("点击了未送达");
        document.getElementById("uploadImageInput").click();
    } else if (status == "待分享" || status == "已完成") {

        let _building_users_id = top.data.find(item => String(item.id) === String(id));
        if (!_building_users_id) {
            top.showMessage('未找到对应快递', 3000, 'red');
            return;
        }
        const currentRecord = _building_users_id;
        _building_users_id = _building_users_id.building_users_id;
        let wechatName = _building_users_id.split(":")[_building_users_id.split(":").length - 1].trim();

        const pickupCodeEl = document.getElementById('share-pickup-code');
        if (pickupCodeEl) {
            pickupCodeEl.textContent = currentRecord.pickupCode || '--';
        }
        setShareNewPriceEditorValue(currentRecord.new_price, currentRecord.price);
        const saveNewPriceBtn = document.getElementById('save-share-new-price-btn');
        if (saveNewPriceBtn) {
            saveNewPriceBtn.onclick = function () {
                const val = getShareNewPriceEditorValue();
                if (val === '__INVALID_CUSTOM__') {
                    top.showMessage('请输入大于等于 0 的价格（最多两位小数）', 3000, 'red');
                    return;
                }
                if (!val) {
                    top.showMessage('请输入第二次定价', 3000, 'red');
                    return;
                }
                updatePriceOnly(id, val, 'new_price', function () {
                    setShareNewPriceEditorValue(val);
                    loadSharePriceSummary(id);
                });
            };
        }

        loadSharePriceSummary(id);

        let xhr = new XMLHttpRequest();
        xhr.open("GET", $HOST + "/getImgDetail.php?pid=" + id, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    let result = JSON.parse(xhr.responseText);
                    if (result.code == 200) {
                        let imgURL = $HOST + "/uploads/" + result.data[0].compressed;
                        top.shareURL = $MAIN + "/detail/share.html?pid=" + encrypt(id);
                        document.getElementById("shareImage").src = imgURL;
                        document.getElementById("downloadImageLink").href = imgURL;
                        // 打开分享弹窗
                        openShareModal();
                        // 为复制按钮绑定事件（确保只绑定一次）
                        const copyBtn = document.getElementById('copy-link-btn');
                        // 先移除可能存在的旧事件
                        copyBtn.onclick = null;
                        // 绑定新事件
                        copyBtn.onclick = function () {
                            const shareURL = top.shareURL;

                            // 复制逻辑（复用已有的复制函数）
                            if (window.AndroidClipboard && typeof AndroidClipboard.copyText === 'function') {
                                AndroidClipboard.copyText(wechatName + "$" + shareURL);
                                top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
                            } else if (navigator.clipboard) {

                                navigator.clipboard.writeText(shareURL).then(function () {
                                    top.showMessage("图片分享地址已复制到剪贴板", 3000, "green");
                                }).catch(function () {
                                    fallbackCopy(shareURL);
                                });
                            } else {
                                fallbackCopy(shareURL);
                            }
                        };
                    } else {
                        top.showMessage(result.msg, 3000, "red");
                    }
                }
            }
        };
        xhr.send();




    } else {
        top.showMessage("内部数据库错误：数据中状态类型不包含'" + status + "'", 6000, "red");
    }
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);

// 打开分享弹窗
function openShareModal() {
    document.getElementById('share-modal').style.display = 'flex';
}

// 关闭分享弹窗
function closeShareModal() {
    document.getElementById('share-modal').style.display = 'none';
}

// 设置当前快递为完成
function setDataSuccess(id) {
    const newPrice = getShareNewPriceEditorValue();
    if (newPrice === '__INVALID_CUSTOM__') {
        top.showMessage('请输入大于等于 0 的价格（最多两位小数）', 3000, 'red');
        return;
    }
    if (newPrice) {
        updatePriceOnly(id, newPrice, 'new_price', function () {
            doSetDataSuccess(id);
        }, { silent: true });
        return;
    }

    doSetDataSuccess(id);
}

function doSetDataSuccess(id) {
    // clickOKisAll
    let clickOKisAll = document.getElementById("clickOKisAll").checked; // 是否全部完成(同一个人都是待分享同一天)
    let xhr = new XMLHttpRequest();
    xhr.open('POST', $HOST + '/setDataSuccess.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            if (result.code === 200) {
                // 如果clickOKisAll没选中，则选中
                if (!clickOKisAll) {
                    document.getElementById("clickOKisAll").checked = true;
                }
                top.showMessage(result.msg);
                closeShareModal()
                getData();

            } else {
                top.showMessage(result.msg, 3000, 'red');
            }
        }
    };
    xhr.send(`id=${id}&token=${getToken()}&clickOKisAll=${clickOKisAll}`)
}

// 删除当前快递的图片数据
function deleteDataStatus(id) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', $HOST + '/deleteDataStatus.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let result = JSON.parse(xhr.responseText);
            if (result.code === 200) {
                top.showMessage(result.msg);
                closeShareModal()
                getData();
            } else if (result.code == 500) {
                top.showMessage(result.msg, 10000, 'red');
            } else {
                top.showMessage(result.msg, 3000, 'red');
            }
        }
    };
    xhr.send(`id=${id}&token=${getToken()}`)
}

// 检查并且更新本地快递的状态
function checkAndUpdateLocalStatus(id, newStatus) {
    let thisElement = document.getElementById("_" + id);
    // 状态ele
    let statusElement = thisElement.querySelector(".status");
    let thisStatus = statusElement.innerText;
    if (thisStatus !== newStatus) {
        let oldClass = statusElement.className; // 保存旧的class

        statusElement.classList.remove("status_red", "status_yellow", "status_green");
        if (newStatus === "未送达") {
            statusElement.classList.add("status_red");
        } else if (newStatus === "待分享") {
            statusElement.classList.add("status_yellow");
        } else if (newStatus === "已完成") {
            statusElement.classList.add("status_green");
        } else {
            console.log("未知状态：" + newStatus);
            top.showMessage("从服务器同步数据异常", 3000, "red");
            // 恢复旧的class
            statusElement.className = oldClass;
            return;
        }
        // 更新状态文本
        statusElement.innerText = newStatus;
        // 更新onclick事件
        statusElement.setAttribute("onclick", `statusClick('${newStatus}', '${id}')`);

        // 同步更新本地全局数据包的状态
        updateTopDataSyncData(id, newStatus);

        console.log(`id=${id} 的状态从 ${thisStatus} 更新为 ${newStatus}`);
    }
}

// 修改本地全局数据包的某个快递的状态
function updateTopDataSyncData(id, newStatus) {
    var count = 0;
    for (let i = 0; i < top.data.length; i++) {
        if (top.data[i].id == id) {
            top.data[i].status = newStatus;
            count++;
        }
    }
    if (count > 0) {
        console.log(`成功更新 ${count} 个快递的状态`);
    } else {
        console.log(`未找到 id=${id} 的快递，异常调用`);
    }
}

// 降级复制方案
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        const successful = document.execCommand('copy');
        if (successful) {
            top.showMessage("分享地址已复制到剪贴板", 3000, "green");
        } else {
            top.showMessage("复制失败，请手动复制", 3000, "red");
        }
    } catch (err) {
        top.showMessage("复制失败，请手动复制", 3000, "red");
    } finally {
        document.body.removeChild(textarea);
    }
}

// 同步数据(同步的是状态)
function getSyncStatusData() {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', $HOST + '/getSyncStatusData.php?' + `type=${dateSelect.value}&datetime=${top.dataLastUpdateTime}&token=${getToken()}`, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            let result = JSON.parse(xhr.responseText);
            if (result.code == 200) {
                console.log("快递状态数据开始同步");
                for (let i = 0; i < result.data.length; i++) {
                    let item = result.data[i];
                    let id = item.id;
                    let status = item.status;
                    // console.log("同步数据：id=" + id + ", status=" + status);
                    checkAndUpdateLocalStatus(id, status);
                }
            } else if (result.code == 201) {
                console.log("今日无数据，同步数据返回为空");
            }
            else {
                top.showMessage("从服务器同步数据失败，服务器返回: " + result.msg, 3000, "red");
                console.log("从服务器同步数据失败");
            }
        }
    };
    xhr.send();
}

// 更新最后同步的时间
function updateSyncLastTime() {
    top.data;
    // 获取top.data[i].

    // 此方法暂时弃用，因为无法实时的判断value的变化
}

// 设置是否为默认同步
function setDefaultSync() {
    if (getDefaultSync()) {
        localStorage.setItem("defaultSync", "false");
        top.showMessage("已关闭默认同步，下次进入生效");
    } else {
        localStorage.setItem("defaultSync", "true");
        top.showMessage("已开启默认同步，下次进入生效");
    }
}

// 获取是否为默认同步
function getDefaultSync() {
    return localStorage.getItem("defaultSync") === "true";
}

// 自动隐藏状态为"已完成"的快递

function augoSetHideSuccess() {
    const table_elements = document.querySelectorAll("#records-table tbody tr");
    // console.log(table_elements);
    let count_num = 0;
    let table_elements_length = table_elements.length;
    for (let i = 0; i < table_elements_length; i++) {
        let now_element = table_elements[i];
        if (now_element.style.display == "none") {
            continue;
        }

        // console.log(now_element);
        let first_td_secend_span = now_element.querySelector("td:nth-child(1) span:nth-child(2)");
        if (first_td_secend_span.innerText == "已完成") {
            now_element.style.display = "none";
            count_num++;
        } else {

        }
    }
    if (count_num > 0) {

        top.showMessage("已自动隐藏 " + count_num + " 个已完成的快递");
    }


}

// 一秒钟更新一次

// setInterval(augoSetHideSuccess, 1000);

top.autoHideInterval = null; // 自动隐藏的定时器

// 开启自动隐藏功能
function startAutoHide() {
    top.autoHideInterval = setInterval(augoSetHideSuccess, 1000);
    localStorage.setItem("autoHide", "true");
}

// 关闭自动隐藏功能
function stopAutoHide() {
    clearInterval(top.autoHideInterval);
    localStorage.setItem("autoHide", "false");
    document.querySelector(".active").click();  // 刷新数据表格
}

// 按钮点击调用
function setAutoHide() {
    let autoHide = localStorage.getItem("autoHide");
    if (autoHide === "true") {
        stopAutoHide();
        document.getElementById("setAutoHideBtn").innerHTML = '<i class="fas fa-clock"></i> 已关闭隐藏';
        top.showMessage("已关闭自动隐藏已完成快递功能");
    } else {
        startAutoHide();
        document.getElementById("setAutoHideBtn").innerHTML = '<i class="fas fa-clock"></i> 已开启隐藏';
        top.showMessage("已开启自动隐藏已完成快递功能");
    }
}

function initAutoHide() {
    let autoHide = localStorage.getItem("autoHide");
    if (autoHide === "true") {
        startAutoHide();
        document.getElementById("setAutoHideBtn").innerHTML = '<i class="fas fa-clock"></i> 已开启隐藏';
    } else {
        stopAutoHide();
        document.getElementById("setAutoHideBtn").innerHTML = '<i class="fas fa-clock"></i> 已关闭隐藏';
    }
}

initAutoHide();


function initGetSyncStatusData() {
    top.showMessage("已自动开启快递状态同步功能，双击页脚版权信息可关闭", 4000, 'green');
    if (getDefaultSync()) {
        setInterval(getSyncStatusData, 5000);
    }
}

//初始化自动同步快递状态
initGetSyncStatusData();

// 新快递的数据同步
function getSyncData() {

}
