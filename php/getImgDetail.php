<?php

// 获取图片分享链接

include 'db.php';
include 'lib.php';

$pid = $_GET['pid'];

$sql = "SELECT * FROM upload_img WHERE pid = '$pid' ORDER BY upload_time DESC LIMIT 1";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $todayCjDetail = getTodayCJ($conn);
    if ($todayCjDetail != "false") {
        // $todayCjDetail = json_decode($todayCjDetail, true);
        $y_n = $todayCjDetail['y_n'];
        if ($y_n == "false") {
            $data[0]['cj'] = "4";//没开奖
        } else {
            $cj = getCJdetail($pid, $conn);//获取抽奖状态
            if ($cj) {
                $data[0]['cj'] = "2";//中奖
            } else {
                $data[0]['cj'] = "3";//未中奖
            }
        }
    } else {
        $data[0]['cj'] = "1";//没有抽奖活动
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