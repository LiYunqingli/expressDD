<?php

// 获取今天有快递数据的微信id，名字以及其当日的第一个快递数据的id
include 'db.php';
include 'lib.php';

// 初始化返回数组（默认错误状态，避免未定义）
$arr = array(
    "code" => 500,
    "msg" => "服务器内部错误",
    "data" => []
);

if (checkParm($_POST['token']) && $_POST['date']) {
    $token = $_POST['token'];
    $date = $_POST['date'];

    if(($userID = checkToken($token, $conn, "2")) != false){
        // token合法
        if($date == "today"){
            $date = date("Y-m-d");
        }
        $sql = "SELECT id, building_users_id, building, room FROM `data` WHERE `time` = '$date'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $dataArr = array();
            while($row = $result->fetch_assoc()) {
                $building_users_id = $row['building_users_id'];
                // 获取微信id和名字
                $sql2 = "SELECT wechat_name FROM building_users WHERE id = '$building_users_id'";
                $result2 = $conn->query($sql2);
                if ($result2->num_rows > 0) {
                    while($row2 = $result2->fetch_assoc()) {
                        $dataArr[] = array(
                            "id" => $row['id'],
                            "wechat_name" => $row2['wechat_name'],
                            "building" => $row['building'],
                            "room" => $row['room']
                        );
                    }
                }else{
                    $dataArr[] = array(
                        "id" => $row['id'],
                        "wechat_name" => "未知用户",
                        "building" => $row['building'],
                        "room" => $row['room']
                    );
                }
            }
            // 有数据时的返回结果
            $arr = array(
                "code" => 200,
                "msg" => "查询成功",
                "data" => $dataArr
            );
        }else{
            $arr = array(
                "code" => 204,
                "msg" => "当天没有快递数据",
                "data" => []
            );
        }
    }else{
        $arr = array(
            "code" => 201,
            "msg" => "token验证失败，非法或者已过期",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 403,
        "msg" => "参数错误，缺少token或date",
        "data" => []
    );
}

echo json_encode($arr);
