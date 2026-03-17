<?php

// 设置某天价格是否公开给客户端。

include 'db.php';
include 'lib.php';

$token = isset($_POST['token']) ? $_POST['token'] : '';
$date = isset($_POST['date']) ? $_POST['date'] : '';
$isPublic = isset($_POST['isPublic']) ? $_POST['isPublic'] : '';

if (!checkParm($token) || !checkParm($date) || $isPublic === '') {
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

$isPublicNum = intval($isPublic) === 1 ? 1 : 0;
$dateEsc = mysqli_real_escape_string($conn, $date);

$sql = "INSERT INTO `price_publish_settings` (`publish_date`, `is_public`) VALUES ('$dateEsc', '$isPublicNum')
        ON DUPLICATE KEY UPDATE `is_public` = VALUES(`is_public`), `update_at` = NOW()";
$result = mysqli_query($conn, $sql);

if ($result) {
    echo json_encode(array(
        "code" => 200,
        "msg" => $isPublicNum === 1 ? "该日价格已公开" : "该日价格已设为不公开",
        "isPublic" => $isPublicNum === 1,
        "date" => $date
    ));
} else {
    echo json_encode(array(
        "code" => 500,
        "msg" => "设置失败"
    ));
}
