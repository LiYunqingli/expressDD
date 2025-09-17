<?php
// 获取指定日期的抽奖结果

include 'db.php';
include 'lib.php';

// 初始化返回数据
$return_data = array();
$arr = array(
    "code" => 500,
    "msg" => "服务器错误",
    "data" => []
);

// 处理日期参数，未传入则默认今天
$date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : date('Y-m-d');

// 查询指定日期的抽奖信息
$sql = "SELECT * FROM lottery WHERE `time` = ? ORDER BY `id` DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $return_data['title'] = $row['title'];
    $return_data['id'] = $row['id'];
}
$stmt->close();

// 查询指定日期的中奖结果（使用统一的date参数）
$sql = "SELECT * FROM lottery_results WHERE DATE(`time`) = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $date);
$stmt->execute();
$result = $stmt->get_result();

if ($result) {
    $winners = array();
    while ($row = $result->fetch_assoc()) {
        $winners[] = $row;
    }

    // 循环获取每个获奖者的building_users_id和对应的building信息
    foreach ($winners as &$winner) {  // 使用引用传递以修改原数组
        // 获取building_users_id
        $pid = $winner['pid'];
        $sql = "SELECT building_users_id FROM `data` WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $pid);
        $stmt->execute();
        $userResult = $stmt->get_result();

        $building_users_id = null;
        if ($userResult && $userResult->num_rows > 0) {
            $userRow = $userResult->fetch_assoc();
            $building_users_id = $userRow['building_users_id'];
            $winner['building_users_id'] = $building_users_id;
        } else {
            $winner['building_users_id'] = null;
        }
        $stmt->close();

        // 使用building_users_id查询building信息
        if (!empty($building_users_id)) {
            $sql = "SELECT building, wechat_name FROM building_users WHERE id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $building_users_id);
            $stmt->execute();
            $buildingResult = $stmt->get_result();

            if ($buildingResult && $buildingResult->num_rows > 0) {
                $buildingRow = $buildingResult->fetch_assoc();
                $winner['building'] = $buildingRow['building'];
                $winner['wechat_name'] = $buildingRow['wechat_name'];
                // 将最后面两位字符改为*
                $winner['building'] = substr($winner['building'], 0, -2) . '**';
            } else {
                $winner['building'] = null;
            }
            $stmt->close();
        } else {
            $winner['building'] = null;
        }
    }

    $return_data['winners'] = $winners;

    // 设置返回状态
    if (count($winners) > 0) {
        $arr = array(
            "code" => 200,
            "msg" => "查询成功",
            "data" => $return_data
        );
    } else {
        $arr = array(
            "code" => 201,
            "msg" => "查询成功，但指定日期没有中奖记录",
            "data" => []
        );
    }
} else {
    $arr['msg'] = "数据库查询失败: " . $conn->error;
}

echo json_encode($arr);
$conn->close();
?>