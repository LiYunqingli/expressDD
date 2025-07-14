<?php
//此文件是删除指定id的数据的

include 'db.php';
include 'lib.php';

$id = $_POST['id'];
//判断data不为空
if (checkParm($id)) {
    $token = $_POST['token'];
    if (checkParm($token)) {
        if (checkToken($token, $conn)) {
            $sql = "DELETE FROM `data` WHERE `id` = '$id'";
            $result = mysqli_query($conn, $sql);
            if ($result) {
                $arr = array(
                    "code" => 200,
                    "msg" => "删除成功"
                );
            }else{
                $arr = array(
                    "code" => 500,
                    "msg" => "删除失败"
                );
            }
        } else {
            $arr = array(
                "code" => 401,
                "msg" => "令牌错误"
            );
        }
    } else {
        $arr = array(
            "code" => 400,
            "msg" => "缺少令牌"
        );
    }
} else {
    $arr = array(
        "code" => 400,
        "msg" => "缺少id",
    );
}

echo json_encode($arr);