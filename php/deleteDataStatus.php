<?php

// 删除数据状态（初始化）

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$id = $_POST['id'];

$arr = array(
    "code" => 500,
    "msg" => "服务器内部错误"
);

if (checkParm($token) && checkParm($id)) {
    if (checkToken($token, $conn)) {
        $sql = "DELETE FROM upload_img WHERE pid = '$id'";
        $result = $conn->query($sql);
        
        if ($result) {
            $sql = "UPDATE `data` SET `status` = '未送达' WHERE `id` = '$id'";
            $result_1 = $conn->query($sql);
            
            if ($result_1) {
                $arr = array(
                    "code" => 200,
                    "msg" => "删除成功"
                );
            } else {
                $arr = array(
                    "code" => 500,
                    "msg" => "数据异常，注意，此时已删除图片，但是状态未更新，请再次操作或者选择修改来更新图片",
                    "error" => $conn->error
                );
            }
        } else {
            $arr = array(
                "code" => 501,
                "msg" => "删除失败",
                "error" => $conn->error
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "token错误"
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "缺少参数"
    );
}

$conn->close();

echo json_encode($arr);
