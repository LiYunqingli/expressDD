<?php

// 创建活动

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$title = $_POST['title'];
$date = $_POST['date'];
$num = $_POST['num'];

if (checkParm($token) && checkParm($title) && checkParm($date) && checkParm($num)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        $sql = "INSERT INTO lottery(title,time,create_by,create_at,num) VALUES ('$title','$date','$userid',now(),'$num')";
        if ($conn->query($sql)) {
            $arr = array(
                "code" => 200,
                "msg" => "创建成功"
            );
        } else {
            $arr = array(
                "code" => 500,
                "msg" => "创建失败"
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "token错误，请重新登录"
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "请求参数错误，缺少必要参数"
    );
}
// 关闭数据库连接
$conn->close();
echo json_encode($arr);