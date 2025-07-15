<?php
include 'db.php';
include 'lib.php';

// 设置响应头为JSON格式
header('Content-Type: application/json; charset=utf-8');

// 获取POST数据
$token = $_POST['token'] ?? '';
$searchInput = $_POST['searchInput'] ?? '';

// 参数验证
if (!checkParm($token) || !checkParm($searchInput)) {
    echo json_encode([
        "code" => 400,
        "msg" => "参数不完整",
        "data" => []
    ]);
    exit;
}

// 验证token
if (!checkToken($token, $conn)) {
    echo json_encode([
        "code" => 401,
        "msg" => "令牌无效或已过期",
        "data" => []
    ]);
    exit;
}

// 安全过滤输入
$searchInput = $conn->real_escape_string($searchInput);
$searchPattern = "%$searchInput%";

// 构建SQL查询
$sql = "SELECT * FROM `data` 
        WHERE building LIKE ? 
        OR room LIKE ? 
        OR pickupCode LIKE ? 
        OR expressNumber LIKE ? 
        OR RIGHT(expressNumber, 4) = ? 
        ORDER BY insert_time DESC";

// 准备语句
$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode([
        "code" => 500,
        "msg" => "数据库查询准备失败: " . $conn->error,
        "data" => []
    ]);
    exit;
}

// 绑定参数
$right4 = substr($searchInput, -4); // 获取最后4位
$stmt->bind_param("sssss", 
    $searchPattern, 
    $searchPattern, 
    $searchPattern, 
    $searchPattern,
    $right4
);

// 执行查询
if (!$stmt->execute()) {
    echo json_encode([
        "code" => 500,
        "msg" => "查询执行失败: " . $stmt->error,
        "data" => []
    ]);
    exit;
}

// 获取结果
$result = $stmt->get_result();
$data = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // 格式化日期时间
        $row['time'] = date('Y-m-d', strtotime($row['time']));
        $row['insert_time'] = date('Y-m-d H:i', strtotime($row['insert_time']));
        $data[] = $row;
    }
}

// 返回结果
echo json_encode([
    "code" => 200,
    "msg" => "查询成功",
    "data" => $data
]);

// 关闭连接
$stmt->close();
$conn->close();
?>