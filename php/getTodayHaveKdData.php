<?php

// 获取今天有快递数据的微信id，名字以及其当日的第一个快递数据的id
include 'db.php';
include 'lib.php';

// 初始化返回数组
$arr = array(
    "code" => 500,
    "msg" => "服务器内部错误",
    "data" => []
);

if (checkParm($_POST['token']) && $_POST['date']) {
    $token = $_POST['token'];
    $date = $_POST['date'];

    if (($userID = checkToken($token, $conn, "2")) != false) {
        // token合法
        if ($date == "today") {
            $date = date("Y-m-d");
        }
        // 查询指定日期的快递数据，按id排序确保取到第一条记录
        $sql = "SELECT id, building_users_id, building, room FROM `data` WHERE `time` = '$date' ORDER BY id ASC";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $dataArr = array();
            $processedUsers = array(); // 记录已处理的building_users_id

            while ($row = $result->fetch_assoc()) {
                $building_users_id = $row['building_users_id'];
                
                // 检查该用户是否已处理过，未处理过才添加
                if (!in_array($building_users_id, $processedUsers)) {
                    // 标记为已处理
                    $processedUsers[] = $building_users_id;
                    
                    // 获取微信名字
                    $sql2 = "SELECT wechat_name FROM building_users WHERE id = '$building_users_id'";
                    $result2 = $conn->query($sql2);
                    $wechat_name = "未知用户";
                    if ($result2->num_rows > 0) {
                        $row2 = $result2->fetch_assoc();
                        $wechat_name = $row2['wechat_name'];
                    }
                    
                    // 添加到结果数组（包含building_users_id）
                    $dataArr[] = array(
                        "id" => $row['id'],
                        "building_users_id" => $building_users_id, // 保留用户ID
                        "wechat_name" => $wechat_name,
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
        } else {
            $arr = array(
                "code" => 204,
                "msg" => "当天没有快递数据",
                "data" => []
            );
        }
    } else {
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
