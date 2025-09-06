<?php

// 获取某一天的活动信息

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$date = $_POST['date'];

if (checkParm($token) && checkParm($date)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        $sql = "SELECT * FROM lottery WHERE `time` = '$date' ORDER BY `id` DESC";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $arr = array(
                "code" => 200,
                "msg" => "获取成功",
                "data" => $result->fetch_all(MYSQLI_ASSOC)
            );
        } else {
            $arr = array(
                "code" => 201,
                "msg" => "获取成功，但当天没有活动",
                "data" => [],
                "sql" => $sql
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "token错误，请重新登录",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "请求参数错误，缺少必要参数",
        "data" => []
    );
}

// 关闭数据库连接
$conn->close();

echo json_encode($arr);