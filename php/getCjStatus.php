<?php

include 'db.php';
include 'lib.php';

$cjStatus;
$todayCjDetail = getTodayCJ($conn);
if ($todayCjDetail != "false") {
    $y_n = $todayCjDetail['y_n'];
    if ($y_n == "false") {
        $cjStatus = 4;//没开奖
    } else {
        $cjStatus = 0;//已开奖
    }
} else {
    $cjStatus = 1;//没有抽奖活动
}

$arr = array(
    "code" => 200,
    "msg" => "success",
    "status" => $cjStatus
);

echo json_encode($arr);