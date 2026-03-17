<?php

// 获取某天的价格公开设置：支持按pid或按date查询。

include 'db.php';
include 'lib.php';

$pid = isset($_GET['pid']) ? $_GET['pid'] : '';
$date = isset($_GET['date']) ? $_GET['date'] : '';
$token = isset($_GET['token']) ? $_GET['token'] : '';

$targetDate = '';

if (checkParm($pid)) {
    $pidEsc = mysqli_real_escape_string($conn, $pid);
    $sql = "SELECT `time` FROM `data` WHERE `id` = '$pidEsc' LIMIT 1";
    $res = $conn->query($sql);
    if ($res && $res->num_rows > 0) {
        $row = $res->fetch_assoc();
        $targetDate = $row['time'];
    } else {
        echo json_encode(array(
            "code" => 404,
            "msg" => "未找到对应快递",
            "isPublic" => false,
            "date" => ''
        ));
        exit;
    }
} elseif (checkParm($date)) {
    if (!checkParm($token) || !checkToken($token, $conn)) {
        echo json_encode(array(
            "code" => 401,
            "msg" => "令牌错误",
            "isPublic" => false,
            "date" => ''
        ));
        exit;
    }
    $targetDate = $date;
} else {
    echo json_encode(array(
        "code" => 400,
        "msg" => "缺少参数",
        "isPublic" => false,
        "date" => ''
    ));
    exit;
}

$dateEsc = mysqli_real_escape_string($conn, $targetDate);
$settingSql = "SELECT `is_public` FROM `price_publish_settings` WHERE `publish_date` = '$dateEsc' LIMIT 1";
$settingRes = $conn->query($settingSql);

$isPublic = false;
if ($settingRes && $settingRes->num_rows > 0) {
    $settingRow = $settingRes->fetch_assoc();
    $isPublic = intval($settingRow['is_public']) === 1;
}

echo json_encode(array(
    "code" => 200,
    "msg" => "获取成功",
    "isPublic" => $isPublic,
    "date" => $targetDate
));
