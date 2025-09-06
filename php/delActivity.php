<?php

// 删除活动信息

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$id = $_POST['id'];

if (checkParm($token) && checkParm($id)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        $sql = "DELETE FROM lottery WHERE id = '$id' AND y_n != 'true'";
        if ($conn->query($sql) === TRUE) {
            // 获取受影响的行数
            $affectedRows = $conn->affected_rows;
            if ($affectedRows > 0) {
                $arr = array(
                    "code" => 200,
                    "msg" => "删除成功，共删除 $affectedRows 条记录"
                );
            } else {
                $arr = array(
                    "code" => 400,
                    "msg" => "未找到符合条件的记录，删除失败(可能是已经开奖)"
                );
            }
        } else {
            $arr = array(
                "code" => 500,
                "msg" => "SQL执行失败：" . $conn->error
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