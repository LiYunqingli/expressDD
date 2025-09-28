<?php

// 此脚本是获取同步数据的接口，使用./getData.php 修改

include 'db.php';
include 'lib.php';

$type = $_GET['type'];
$datetime = $_GET['datetime'];//只返回这个时间后面的数据，如果需要当天或者全部，传入none

if (checkParm($type) && checkParm($datetime)) {
    $token = $_GET['token'];
    if (checkParm($token)) {
        if (checkToken($token, $conn)) {
            if ($type != "all") {
                if ($datetime == "none") {
                    $datetime = $type . " 00:00:00"; //如果传入none返回全天的数据
                }
                //返回某天的数据
                $sql = "SELECT * FROM `data` WHERE `time` = '$type' AND insert_time > '$datetime' ORDER BY id ASC";
            } else {
                //返回完整数据
                $sql = "SELECT * FROM `data` ORDER BY id ASC";
            }
            $result = $conn->query($sql);
            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                //将数据遍历出来
                for ($i = 0; $i < count($data); $i++) {
                    $building_users_id = $data[$i]['building_users_id'];
                    $sql = "SELECT * FROM `building_users` WHERE `id` = '$building_users_id'";
                    $result = $conn->query($sql);
                    if ($result->num_rows > 0) {
                        while ($row = $result->fetch_assoc()) {
                            $data[$i]['building_users_id'] .= ": " . $row['wechat_name'];
                        }
                    } else {
                        $data[$i]['building_users_id'] .= ": null";
                    }
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
        "msg" => "缺少type，或者datetime",
        "data" => []
    );
}

echo json_encode($arr);