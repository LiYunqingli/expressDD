<?php

// 发起抽奖

$key = $_GET['key'];

include 'db.php';
include 'lib.php';

if (checkParm($key)) {
    if ($key == "Aa123456Aa123456") {
        $sql = "SELECT * FROM lottery WHERE `time` = CURDATE() AND y_n = 'false' ORDER BY `id` DESC";
        //将数据拿出来 $conn
        $res = $conn->query($sql);
        $info = array();
        while ($row = $res->fetch_assoc()) {
            $info[] = $row;
        }
        if (count($info) > 0) {
            //取第一个
            $info = $info[0];
            $num = $info['num'];
            $hdID = $info['id'];

            $data_sql = "SELECT * FROM `data` WHERE `time` = CURDATE()";
            $data_res = $conn->query($data_sql);
            $data_info = array();
            while ($row = $data_res->fetch_assoc()) {
                $data_info[] = $row;
            }
            if (count($data_info) > 0) {
                $ooo = [];//中奖名单
                if (count($data_info) <= $num) {
                    //直接全部发奖，跳过抽取
                    for ($i = 0; $i < count($data_info); $i++) {
                        $ooo[] = $data_info[$i]['id'];
                    }
                } else {
                    $rand_all_id = [];
                    for ($i = 0; $i < count($data_info); $i++) {
                        $rand_all_id[] = $data_info[$i]['id'];
                    }
                    // 修复：确保$rand始终是数组
                    $rand = array_rand($rand_all_id, $num);
                    if (!is_array($rand)) {
                        $rand = array($rand);
                    }
                    // 使用foreach更安全
                    foreach ($rand as $r) {
                        $ooo[] = $rand_all_id[$r];
                    }
                }
                $insert_ooo_sql = "INSERT INTO lottery_results (hdID, pid, time) VALUES ";
                foreach ($ooo as $id) {
                    $insert_ooo_sql .= "('$hdID', '$id', NOW()),";
                }
                $insert_ooo_sql = rtrim($insert_ooo_sql, ',');
                $insert_ooo_res = mysqli_query($conn, $insert_ooo_sql);
                if ($insert_ooo_res) {
                    $update_sta_sql = "UPDATE lottery SET y_n = 'true' WHERE id = '$hdID'";
                    $update_sta_res = mysqli_query($conn, $update_sta_sql);
                    if ($update_sta_res) {
                        $arr = array(
                            "code" => 200,
                            "msg" => "抽奖成功",
                            "data" => $ooo,
                        );
                    } else {
                        $arr = array(
                            "code" => 500,
                            "msg" => "抽奖结果(修改抽奖状态)插入失败，但是数据已经插入成功",
                            "data" => $ooo,
                        );
                    }
                } else {
                    $arr = array(
                        "code" => 500,
                        "msg" => "抽奖结果插入失败",
                        "data" => $ooo,
                    );
                }
            } else {
                $arr = array(
                    "code" => 404,
                    "msg" => "有抽奖活动，但是今天没接单"
                );
            }
        } else {
            $arr = array(
                "code" => 404,
                "msg" => "今天没有抽奖活动或者已经抽取过了"
            );
        }
    } else {
        $arr = array(
            "code" => 403,
            "msg" => "秘钥错误，禁止访问"
        );
    }
} else {
    $arr = array(
        "code" => 401,
        "msg" => "缺少秘钥"
    );
}

echo json_encode($arr);
