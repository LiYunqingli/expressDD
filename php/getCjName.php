<?php

// 获取抽奖名称

include 'db.php';
include 'lib.php';

$pid = $_GET['id'];

$date = getJidToDate($pid, $conn)['time'];


$sql = "SELECT * FROM lottery WHERE `time` = '$date' ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);
if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $title = $row['title'];
    $arr = array(
        "code" => 200,
        "msg" => "获取成功",
        "name" => $title
    );
} else {
    $arr = array(
        "code" => 404,
        "msg" => "当天没有抽奖活动",
        "data" => []
    );
}

echo json_encode($arr);