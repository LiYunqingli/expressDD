<?php

// 设置快递完成配送

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$id = $_POST['id'];

if (checkParm($token) && checkParm($id)) {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        // 使用预处理语句防止SQL注入
        $sql = "UPDATE `data` SET `status` = '已完成' WHERE `id` = ?";
        $stmt = $conn->prepare($sql);

        if ($stmt === false) {
            // 准备语句失败
            $arr = array(
                "code" => 500,
                "msg" => "数据库错误：" . $conn->error
            );
        } else {
            // 绑定参数并执行
            $stmt->bind_param("i", $id); // 假设id是整数类型
            $result = $stmt->execute();

            if ($result === false) {
                // 执行失败
                $arr = array(
                    "code" => 500,
                    "msg" => "设置失败：" . $stmt->error
                );
            } elseif ($stmt->affected_rows > 0) {
                // 执行成功且有记录被更新
                $arr = array(
                    "code" => 200,
                    "msg" => "设置成功"
                );
            } else {
                // 执行成功但没有记录被更新（可能id不存在）
                $arr = array(
                    "code" => 404,
                    "msg" => "未找到对应记录或状态已为完成"
                );
            }
            $stmt->close();
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

echo json_encode($arr);
