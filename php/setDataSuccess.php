<?php

// 设置快递完成配送

include 'db.php';
include 'lib.php';

$token = $_POST['token'];
$id = $_POST['id'];
$clickOKisAll = $_POST['clickOKisAll'];

if (checkParm($token) && checkParm($clickOKisAll)) {
    // 检查clickOKisAll是否为布尔值
    $isAll = filter_var($clickOKisAll, FILTER_VALIDATE_BOOLEAN);

    // 当不是全部操作时，才需要检查id参数
    if (!$isAll && !checkParm($id)) {
        $arr = array(
            "code" => 401,
            "msg" => "缺少参数"
        );
        echo json_encode($arr);
        exit;
    }

    if (($userid = checkToken($token, $conn, '2')) != false) {
        // 使用预处理语句防止SQL注入
        if ($isAll) {
            // 如果clickOKisAll为true，将所有待分享的订单状态改为已完成
            // 先查询符合条件的building_users_id
            $sqlSelect = "SELECT building_users_id FROM `data` WHERE `id` = ?";
            $stmtSelect = $conn->prepare($sqlSelect);

            if ($stmtSelect === false) {
                $arr = array(
                    "code" => 500,
                    "msg" => "数据库错误：" . $conn->error
                );
                echo json_encode($arr);
                exit;
            }

            $stmtSelect->bind_param("i", $id);
            $stmtSelect->execute();
            $resultSelect = $stmtSelect->get_result();

            if ($resultSelect->num_rows === 0) {
                $arr = array(
                    "code" => 404,
                    "msg" => "未找到对应记录"
                );
                $stmtSelect->close();
                echo json_encode($arr);
                exit;
            }

            $row = $resultSelect->fetch_assoc();
            $buildingUsersId = $row['building_users_id'];
            $stmtSelect->close();

            // 更新当天所有待分享状态的订单
            $sqlUpdate = "UPDATE `data` SET `status` = '已完成' WHERE `building_users_id` = ? AND `time` = CURDATE() AND `status` = '待分享'";
            $stmtUpdate = $conn->prepare($sqlUpdate);

            if ($stmtUpdate === false) {
                $arr = array(
                    "code" => 500,
                    "msg" => "数据库错误：" . $conn->error
                );
            } else {
                $stmtUpdate->bind_param("i", $buildingUsersId);
                $resultUpdate = $stmtUpdate->execute();

                if ($resultUpdate === false) {
                    $arr = array(
                        "code" => 500,
                        "msg" => "设置失败：" . $stmtUpdate->error
                    );
                } else {
                    $updatedCount = $stmtUpdate->affected_rows;
                    if ($updatedCount > 0) {
                        $arr = array(
                            "code" => 200,
                            "msg" => "成功设置{$updatedCount}个订单为已完成",
                            "count" => $updatedCount
                        );
                    } else {
                        $arr = array(
                            "code" => 404,
                            "msg" => "未找到符合条件的待分享订单"
                        );
                    }
                }
                $stmtUpdate->close();
            }
        } else {
            // 如果clickOKisAll为false，将指定订单状态改为已完成
            $sql = "UPDATE `data` SET `status` = '已完成' WHERE `id` = ?";
            $stmt = $conn->prepare($sql);

            if ($stmt === false) {
                $arr = array(
                    "code" => 500,
                    "msg" => "数据库错误：" . $conn->error
                );
            } else {
                $stmt->bind_param("i", $id); // 假设id是整数类型
                $result = $stmt->execute();

                if ($result === false) {
                    $arr = array(
                        "code" => 500,
                        "msg" => "设置失败：" . $stmt->error
                    );
                } elseif ($stmt->affected_rows > 0) {
                    $arr = array(
                        "code" => 200,
                        "msg" => "设置成功"
                    );
                } else {
                    $arr = array(
                        "code" => 404,
                        "msg" => "未找到对应记录或状态已为完成"
                    );
                }
                $stmt->close();
            }
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
