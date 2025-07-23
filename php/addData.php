<?php

//增加数据的接口


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
            // $pickupCode = $data['pickupCode'];
            // $expressNumber = $data['expressNumber'];
            $codes = $data['codes'];
            $notes = $data['notes'];

            $values = "";
            for ($i = 0; $i < count($codes); $i++){
                $code = $codes[$i];
                $pickupCode = $code['pickupCode'];
                $expressNumber = $code['expressNumber'];
                $values .= "('$time', NOW(), '$building','$room','$pickupCode', '$expressNumber','$notes'),";
            }
            $values = rtrim($values, ',');
            $sql = "INSERT INTO `data` (`time`, insert_time, building, room, pickupCode, expressNumber, notes) VALUES $values";
            // echo $sql;
            // echo json_encode($codes);
            $result = mysqli_query($conn, $sql);
            if ($result) {
                $arr = array(
                    "code" => 200,
                    "msg" => "成功添加'" . count($codes) . "' 条记录"
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