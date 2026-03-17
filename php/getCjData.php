<?php

// 获取抽奖结果（传入一个快递的id，然后返回这个id对应的这个人今天除了id以外的所有快递）

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

$pid = $_POST['pid'];

if (checkParm($pid)) {
    $sql = "SELECT building_users_id, `time` FROM `data` WHERE id = '$pid'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        $data = $result->fetch_assoc();
        $time = $data['time'];
        $data = $data['building_users_id'];
        $sql = "SELECT * FROM `data` WHERE building_users_id = '$data' AND id != '$pid' AND `time` = '$time'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $data = $result->fetch_all(MYSQLI_ASSOC);
            $new_data = array();
            for ($i = 0; $i < count($data); $i++) {
                $status = $data[$i]['status'];
                $id = $data[$i]['id'];
                $pickupCode = $data[$i]['pickupCode'];
                $price = $data[$i]['price'];
                $newPrice = isset($data[$i]['new_price']) ? $data[$i]['new_price'] : '';
                $displayPrice = calcDisplayPrice($price, $newPrice);
                if ($status == "未送达") {
                    $status = 0;
                } else if ($status == "待分享") {
                    $status = 1;
                } else if ($status == "已完成") {
                    $status = 2;
                } else {
                    $status = 0;
                }

                // 中奖状态
                $cjStatus;
                $idToDate = getJidToDate($pid, $conn);
                $todayCjDetail = getTodayCJ($conn, $idToDate['time']);
                if ($todayCjDetail != "false") {
                    // $todayCjDetail = json_decode($todayCjDetail, true);
                    $y_n = $todayCjDetail['y_n'];
                    if ($y_n == "false") {
                        $cjStatus = 4;//没开奖
                    } else {
                        $cj = getCJdetail($id, $conn);//获取抽奖状态
                        if ($cj) {
                            $cjStatus = 2;//中奖
                        } else {
                            $cjStatus = 3;//未中奖
                        }
                    }
                } else {
                    $cjStatus = 1;//没有抽奖活动
                }

                $new_data[$i] = array(
                    "expressNo" => $data[$i]['id'],
                    "deliveryStatus" => $status,
                    "lotteryStatus" => $cjStatus,
                    "pickupCode" => $pickupCode,
                    "price" => $price,
                    "new_price" => $newPrice,
                    "display_price" => $displayPrice
                );
            }
            $arr = array(
                "code" => 200,
                "msg" => "成功",
                "data" => $new_data
            );
        } else {
            $arr = array(
                "code" => 201,
                "msg" => "当天只有一个快递",
                "data" => []
            );
        }
    } else {
        $arr = array(
            "code" => 404,
            "msg" => "没有找到这个快递",
            "data" => []
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "参数错误",
        "data" => []
    );
}

echo json_encode($arr);