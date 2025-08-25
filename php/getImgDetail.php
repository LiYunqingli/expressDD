<?php

// 获取图片分享链接

include 'db.php';

$pid = $_GET['pid'];

$sql = "SELECT * FROM upload_img WHERE pid = '$pid'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $arr = array(
        "code" => 200,
        "msg" => "获取成功",
        "data" => $data
    );
} else {
    $arr = array(
        "code" => 404,
        "msg" => "这个图片不存在",
        "data" => []
    );
}

echo json_encode($arr);
$conn->close();