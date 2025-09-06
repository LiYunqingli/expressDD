<?php

// 修改活动信息

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$title = $_POST['title'];
$num = $_POST['num'];
$id = $_POST['id'];

if (checkParm($token) && checkParm($title) && checkParm($num) && checkParm($id)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        $sql = "UPDATE lottery SET title='$title', num='$num' WHERE id=$id";
        if ($conn->query($sql)) {
            $arr = array(
                "code" => 200,
                "msg" => "修改成功"
            );
        } else {
            $arr = array(
                "code" => 500,
                "msg" => "修改失败"
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

echo json_encode($arr);