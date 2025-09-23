<?php

// 获取取件码（传入一个快递的id，然后返回这个id对应的这个人今天的取件码）

include 'db.php';
include 'lib.php';

$pid = $_GET['pid'];

if (checkParm($pid)) {
    $sql = "SELECT pickupCode FROM `data` WHERE id = '$pid'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        $pickupCode = $data['pickupCode'];
        $arr = array(
            "code" => 200,
            "msg" => "获取成功",
            "pickupCode" => $pickupCode
        );
    }else{
        $arr = array(
            "code" => 404,
            "msg" => "未找到该快递",
            "pickupCode" => ''
        );
    }
}else {
    $arr = array(
        "code" => 401,
        "msg" => "参数错误",
        "pickupCode" => ''
    );
}

echo json_encode($arr);