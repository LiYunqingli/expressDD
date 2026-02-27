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
        if (($userid = checkToken($token, $conn, "2")) != false) {
            $time = $data['time'];
            $building = $data['building'];
            $room = $data['room'];
            // $pickupCode = $data['pickupCode'];
            // $expressNumber = $data['expressNumber'];
            $codes = $data['codes'];
            $notes = $data['notes'];
            $notes_img = isset($data['notes_img']) ? $data['notes_img'] : '';
            $building_users_id = $data['building_users_id'];

            // basic escaping to reduce SQL injection risk in this endpoint
            $time = mysqli_real_escape_string($conn, $time);
            $building = mysqli_real_escape_string($conn, $building);
            $room = mysqli_real_escape_string($conn, $room);
            $notes = mysqli_real_escape_string($conn, $notes);
            $notes_img = mysqli_real_escape_string($conn, $notes_img);
            $userid = mysqli_real_escape_string($conn, $userid);
            $building_users_id = mysqli_real_escape_string($conn, $building_users_id);

            $values = "";
            for ($i = 0; $i < count($codes); $i++){
                $code = $codes[$i];
                $pickupCode = isset($code['pickupCode']) ? $code['pickupCode'] : '';
                $expressNumber = isset($code['expressNumber']) ? $code['expressNumber'] : '';
                $pickupCode = mysqli_real_escape_string($conn, $pickupCode);
                $expressNumber = mysqli_real_escape_string($conn, $expressNumber);
                $values .= "('$time', NOW(), '$building','$room','$pickupCode', '$expressNumber','$notes', '$notes_img', '$userid', '$building_users_id'),";
            }
            $values = rtrim($values, ',');
            $sql = "INSERT INTO `data` (`time`, insert_time, building, room, pickupCode, expressNumber, notes, notes_img, create_at, building_users_id) VALUES $values";
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
