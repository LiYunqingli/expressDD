<?php

// 增加客户微信

include 'db.php';
include 'lib.php';

$building = $_POST['building'];
$room = $_POST['room'];
$weChatName = $_POST['weChatName'];
$token = $_POST['token'];

if (checkParm($building) && checkParm($room) && checkParm($weChatName) && checkParm($token)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        $searchStr = $building . "-" . $room;
        $sql = "SELECT * FROM building_users WHERE building = '$searchStr' AND wechat_name = '$weChatName'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $arr = array(
                "code" => 402,
                "msg" => "该宿舍中已存在"
            );
        } else {
            $sql = "INSERT INTO building_users (building, wechat_name, create_at) VALUES ('$searchStr', '$weChatName', '$userid')";
            $result = $conn->query($sql);
            if ($result) {
                $arr = array(
                    "code" => 200,
                    "msg" => "添加成功"
                );
            } else {
                $arr = array(
                    "code" => 500,
                    "msg" => "服务器异常导致添加失败"
                );
            }
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "令牌错误，请重新登录"
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "请求参数错误"
    );
}

echo json_encode($arr);