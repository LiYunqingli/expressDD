<?php

include 'db.php';
include 'lib.php';

$token = $_POST['token'];

if (checkParm($token)) {
    if (($userid = checkToken($token, $conn, "2")) != false) {
        $sql = "SELECT * FROM building_users ORDER BY id DESC";
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
                "msg" => "获取成功，但无数据",
                "data" => []
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "token非法或者已过期，请重新登录",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "请求参数错误，缺少token",
        "data" => []
    );
}

$conn->close();

echo json_encode($arr);