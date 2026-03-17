<?php

include 'db.php';
include 'lib.php';

$token = isset($_POST['token']) ? $_POST['token'] : '';
$id = isset($_POST['id']) ? $_POST['id'] : '';
$price = isset($_POST['price']) ? $_POST['price'] : '';
$field = isset($_POST['field']) ? $_POST['field'] : 'price';

if (!checkParm($token) || !checkParm($id) || !isset($_POST['price']) || trim((string) $price) === '') {
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

$price = trim((string) $price);
if (!preg_match('/^\d+(\.\d{1,2})?$/', $price)) {
    echo json_encode(array(
        "code" => 402,
        "msg" => "价格格式错误，最多两位小数"
    ));
    exit;
}

if ($field !== 'price' && $field !== 'new_price') {
    echo json_encode(array(
        "code" => 405,
        "msg" => "不支持的价格字段"
    ));
    exit;
}

$priceNum = floatval($price);
if ($priceNum < 0) {
    echo json_encode(array(
        "code" => 403,
        "msg" => "价格必须大于等于0"
    ));
    exit;
}

$priceStr = number_format($priceNum, 2, '.', '');
$idEsc = mysqli_real_escape_string($conn, $id);
$priceEsc = mysqli_real_escape_string($conn, $priceStr);
$fieldEsc = mysqli_real_escape_string($conn, $field);

$sql = "UPDATE `data` SET `$fieldEsc` = '$priceEsc', `insert_time` = NOW() WHERE `id` = '$idEsc'";
$result = mysqli_query($conn, $sql);

if ($result) {
    if (mysqli_affected_rows($conn) >= 0) {
        echo json_encode(array(
            "code" => 200,
            "msg" => "价格更新成功",
            "price" => $priceStr,
            "field" => $field
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
