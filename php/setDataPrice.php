<?php

include 'db.php';
include 'lib.php';

$token = isset($_POST['token']) ? $_POST['token'] : '';
$id = isset($_POST['id']) ? $_POST['id'] : '';
$price = isset($_POST['price']) ? $_POST['price'] : '';

if (!checkParm($token) || !checkParm($id) || !checkParm($price)) {
    echo json_encode(array(
        "code" => 400,
        "msg" => "缺少参数"
    ));
    exit;
}

if (!checkToken($token, $conn)) {
    echo json_encode(array(
        "code" => 401,
        "msg" => "令牌错误"
    ));
    exit;
}

if (!is_numeric($price)) {
    echo json_encode(array(
        "code" => 402,
        "msg" => "价格格式错误"
    ));
    exit;
}

$priceNum = floatval($price);
if ($priceNum <= 0) {
    echo json_encode(array(
        "code" => 403,
        "msg" => "价格必须大于0"
    ));
    exit;
}

$priceStr = number_format($priceNum, 1, '.', '');
$idEsc = mysqli_real_escape_string($conn, $id);
$priceEsc = mysqli_real_escape_string($conn, $priceStr);

$sql = "UPDATE `data` SET `price` = '$priceEsc', `insert_time` = NOW() WHERE `id` = '$idEsc'";
$result = mysqli_query($conn, $sql);

if ($result) {
    if (mysqli_affected_rows($conn) >= 0) {
        echo json_encode(array(
            "code" => 200,
            "msg" => "价格更新成功",
            "price" => $priceStr
        ));
    } else {
        echo json_encode(array(
            "code" => 404,
            "msg" => "未找到对应记录"
        ));
    }
} else {
    echo json_encode(array(
        "code" => 500,
        "msg" => "价格更新失败"
    ));
}
