<?php

//次文件是新建数据


//获取json数据
$data = file_get_contents('php://input');

//将json数据转换为数组
$data = json_decode($data, true);

include 'db.php';
include 'lib.php';

//判断data不为空
if (!empty($data)) {
    $token = $data['token'];
    if (checkParm($token)) {
        if (checkToken($token, $conn)) {
            $time = $data['time'];
            $building = $data['building'];
            $room = $data['room'];
            $pickupCode = $data['pickupCode'];
            $expressNumber = $data['expressNumber'];
            $notes = $data['notes'];
            $sql = "INSERT INTO `data` (`time`, insert_time, building, room, pickupCode, expressNumber, notes) VALUES('$time', NOW(), '$building','$room','$pickupCode', '$expressNumber','$notes')";
            $result = mysqli_query($conn, $sql);
            if ($result) {
                $arr = array(
                    "code" => 200,
                    "msg" => "添加成功"
                );
            }else{
                $arr = array(
                    "code" => 500,
                    "msg" => "添加失败"
                );
            }
        } else {
            $arr = array(
                "code" => 401,
                "msg" => "令牌错误"
            );
        }
    } else {
        $arr = array(
            "code" => 400,
            "msg" => "缺少令牌"
        );
    }
} else {
    $arr = array(
        "code" => 400,
        "msg" => "缺少数据",
    );
}

echo json_encode($arr);