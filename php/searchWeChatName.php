<?php

// 查找微信名（宿舍里面所有的已经存在的记录）

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$building = $_POST['building'];
$room = $_POST['room'];

if (checkParm($token) && checkParm($building) && checkParm($room)) {
    if (checkToken($token, $conn)) {
        $searchStr = $building . "-" . $room;
        $sql = "SELECT * FROM building_users WHERE building = '$searchStr'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $arr = array(
                "code" => 200,
                "msg" => "查询成功",
                "data" => $result->fetch_all(MYSQLI_ASSOC)
            );
        } else {
            $arr = array(
                "code" => 404,
                "msg" => "查询失败",
                "data" => []
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "令牌错误",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "请求参数错误",
        "data" => []
    );
}

echo json_encode($arr);