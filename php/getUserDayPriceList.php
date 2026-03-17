<?php

// 获取某条快递所属用户在当天的全部快递价格信息（包含本条）。

include 'db.php';
include 'lib.php';

$token = isset($_GET['token']) ? $_GET['token'] : '';
$pid = isset($_GET['pid']) ? $_GET['pid'] : '';

if (!checkParm($token) || !checkParm($pid)) {
    echo json_encode(array(
        "code" => 400,
        "msg" => "缺少参数",
        "data" => array(),
        "totalPrice" => 0,
        "totalNewPrice" => 0,
        "grandTotal" => 0
    ));
    exit;
}

if (!checkToken($token, $conn)) {
    echo json_encode(array(
        "code" => 401,
        "msg" => "令牌错误",
        "data" => array(),
        "totalPrice" => 0,
        "totalNewPrice" => 0,
        "grandTotal" => 0
    ));
    exit;
}

$pidEsc = mysqli_real_escape_string($conn, $pid);
$baseSql = "SELECT `building_users_id`, `time` FROM `data` WHERE `id` = '$pidEsc' LIMIT 1";
$baseRes = $conn->query($baseSql);

if (!$baseRes || $baseRes->num_rows === 0) {
    echo json_encode(array(
        "code" => 404,
        "msg" => "未找到对应快递",
        "data" => array(),
        "totalPrice" => 0,
        "totalNewPrice" => 0,
        "grandTotal" => 0
    ));
    exit;
}

$base = $baseRes->fetch_assoc();
$buildingUsersId = mysqli_real_escape_string($conn, $base['building_users_id']);
$time = mysqli_real_escape_string($conn, $base['time']);

$sql = "SELECT `id`, `pickupCode`, `price`, `new_price` 
        FROM `data` 
        WHERE `building_users_id` = '$buildingUsersId' AND `time` = '$time'
        ORDER BY `id` ASC";
$res = $conn->query($sql);

$list = array();
$totalPrice = 0;
$totalNewPrice = 0;

if ($res && $res->num_rows > 0) {
    while ($row = $res->fetch_assoc()) {
        $priceNum = is_numeric($row['price']) ? floatval($row['price']) : 0;
        $newPriceNum = is_numeric($row['new_price']) ? floatval($row['new_price']) : 0;
        $avg = ($priceNum + $newPriceNum) / 2;

        $totalPrice += $priceNum;
        $totalNewPrice += $newPriceNum;

        $list[] = array(
            "id" => $row['id'],
            "pickupCode" => $row['pickupCode'],
            "price" => $row['price'],
            "new_price" => $row['new_price'],
            "avg" => number_format($avg, 1, '.', '')
        );
    }
}

echo json_encode(array(
    "code" => 200,
    "msg" => "获取成功",
    "time" => $base['time'],
    "data" => $list,
    "totalPrice" => number_format($totalPrice, 1, '.', ''),
    "totalNewPrice" => number_format($totalNewPrice, 1, '.', ''),
    "grandTotal" => number_format($totalPrice + $totalNewPrice, 1, '.', '')
));
