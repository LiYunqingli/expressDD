<?php

// 获取取件码（传入一个快递的id，然后返回这个id对应的这个人今天的取件码）

include 'db.php';
include 'lib.php';

function calcDisplayPrice($priceRaw, $newPriceRaw)
{
    $hasPrice = is_numeric($priceRaw) && floatval($priceRaw) > 0;
    $hasNewPrice = is_numeric($newPriceRaw) && floatval($newPriceRaw) > 0;

    if ($hasPrice && $hasNewPrice) {
        return number_format((floatval($priceRaw) + floatval($newPriceRaw)) / 2, 1, '.', '');
    }
    if ($hasPrice) {
        return number_format(floatval($priceRaw), 1, '.', '');
    }
    if ($hasNewPrice) {
        return number_format(floatval($newPriceRaw), 1, '.', '');
    }
    return '';
}

$pid = $_GET['pid'];

if (checkParm($pid)) {
    $sql = "SELECT pickupCode, price, new_price, status FROM `data` WHERE id = '$pid'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        $pickupCode = $data['pickupCode'];
        $price = isset($data['price']) ? $data['price'] : '';
        $newPrice = isset($data['new_price']) ? $data['new_price'] : '';
        $status = isset($data['status']) ? $data['status'] : '';
        $displayPrice = calcDisplayPrice($price, $newPrice);
        $arr = array(
            "code" => 200,
            "msg" => "获取成功",
            "pickupCode" => $pickupCode,
            "price" => $price,
            "new_price" => $newPrice,
            "display_price" => $displayPrice,
            "status" => $status
        );
    } else {
        $arr = array(
            "code" => 404,
            "msg" => "未找到该快递",
            "pickupCode" => '',
            "price" => '',
            "new_price" => '',
            "display_price" => '',
            "status" => ''
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "参数错误",
        "pickupCode" => '',
        "price" => '',
        "new_price" => '',
        "display_price" => '',
        "status" => ''
    );
}

echo json_encode($arr);