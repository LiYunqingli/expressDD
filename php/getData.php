<?php

//返回当天的数据和和或者完整数据

include 'db.php';
include 'lib.php';

$type = $_GET['type'];

if (checkParm($type)) {
    $token = $_GET['token'];
    if (checkParm($token)) {
        if (checkToken($token, $conn)) {
            if ($type != "all") {
                //返回某天的数据
                $sql = "SELECT * FROM `data` WHERE `time` = '$type' ORDER BY id DESC";
            } else {
                //返回完整数据
                $sql = "SELECT * FROM `data` ORDER BY id DESC";
            }
            $result = $conn->query($sql);
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                $arr = array(
                    "code" => 200,
                    "msg" => "获取数据成功",
                    "data" => $data
                );
            } else {
                $arr = array(
                    "code" => 201,
                    "msg" => $type . "没有数据",
                    "data" => []
                );
            }
        } else {
            $arr = array(
                "code" => 401,
                "msg" => "令牌错误",
                "data" => []
            );
        }
    } else {
        $arr = array(
            "code" => 400,
            "msg" => "缺少令牌",
            "data" => []
        );
    }

} else {
    $arr = array(
        "code" => 400,
        "msg" => "缺少type",
        "data" => []
    );
}

echo json_encode($arr);