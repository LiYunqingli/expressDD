<?php

//此脚本用来获取所有数据

include 'db.php';
include 'lib.php';

$token = $_GET['token'];

if (!checkParm($token)) {
    echo json_encode(array(
        "code" => 400,
        "msg" => "缺少令牌",
        "data" => []
    ));
    exit;
}

if (!checkToken($token, $conn)) {
    echo json_encode(array(
        "code" => 202,
        "msg" => "无效的令牌，请重新登录",
        "data" => []
    ));
    exit;
}

// users;building;data

$users_sql = "SELECT * FROM users";
$building_sql = "SELECT * FROM building";
$data_sql = "SELECT * FROM `data`";

$users_result = $conn->query($users_sql);
$building_result = $conn->query($building_sql);
$data_result = $conn->query($data_sql);

$users = array();
$building = array();
$data = array();

if ($users_result->num_rows > 0) {
    while ($row = $users_result->fetch_assoc()) {
        array_push($users, $row);
    }
}

if ($building_result->num_rows > 0) {
    while ($row = $building_result->fetch_assoc()) {
        array_push($building, $row);
    }
}

if ($data_result->num_rows > 0) {
    while ($row = $data_result->fetch_assoc()) {
        array_push($data, $row);
    }
}

echo json_encode(array(
    "code" => 200,
    "msg" => "获取所有数据成功",
    "data" => array(
        "users" => $users,
        "building" => $building,
        "data" => $data
    )
));