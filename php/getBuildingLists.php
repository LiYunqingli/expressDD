<?php

//获取getBuildingLists，返回所有建筑列表

//公开的数据，无需校验

include 'db.php';

// $sql = "SELECT * FROM building";
//按照id排序
$sql = "SELECT * FROM building ORDER BY id ASC";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $arr = array(
        "code" => 200,
        "msg" => "success",
        "data" => $data
    );
} else {
    $arr = array(
        "code" => 404,
        "msg" => "no data",
        "data" => []
    );
}

echo json_encode($arr);