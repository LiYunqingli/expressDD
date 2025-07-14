<?php

include 'db.php';

//这个接口是后获取本月有多少个订单

$today = $_GET['today'];

$date_arr = explode("-", $today);
$month = $date_arr[1];

$sql = "SELECT COUNT(*) as TotalNum FROM `data` WHERE MONTH(`time`) = '$month'";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $num = 0;
    while ($row = $result->fetch_assoc()) {
        $num = $row['TotalNum'];
    }
    $arr = array(
        "code" => 200,
        "msg" => "获取成功",
        "num" => $num
    );
} else {
    $ar = array(
        "code" => 400,
        "msg" => "无数据",
        "num" => 0
    );
}
// $conn->close();

echo json_encode($arr);