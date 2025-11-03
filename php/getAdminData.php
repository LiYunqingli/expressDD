<?php

// 获取配送员的具体数据 （用于数据分析）

include 'db.php';
include 'lib.php';

if (checkParm($_POST['token']) && checkParm($_POST['adminID'])) {
    $token = $_POST['token'];
    $adminID = $_POST['adminID'];

    if (checkToken($token, $conn)) {
        $sql = "SELECT id, building_users_id, time, building, room FROM data WHERE create_at = '$adminID'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $data = array();
            while ($row = $result->fetch_assoc()) {
                array_push($data, $row);
            }
            $arr = array(
                "code" => 200,
                "msg" => "查询成功",
                "data" => $data
            );
        } else {
            $arr = array(
                "code" => 201,
                "msg" => "未找到该管理员",
                "data" => []
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "token非法或者已过期",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "缺少参数",
        "data" => []
    );
}

echo json_encode($arr);