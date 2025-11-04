<?php

// 统计访问日志(对应/js/log.js方法)

// create by LiHuarong at 2025-11-4


include 'db.php';
include 'lib.php';



if(checkParm($_POST['url']) && checkParm($_POST['detail'])){
    $url = $_POST['url'];
    $detail = $_POST['detail'];
    // $$$$$
    // 获取客户端的ip地址，此方法无效，需要支持（可以反向代理实现？？？）
    $ip = getClientIp();
    $ua = $_SERVER['HTTP_USER_AGENT'];
    $time = date("Y-m-d H:i:s");

    $sql = "INSERT INTO `logs` (`url`, `detail`, `ip`, `ua`, `time`) VALUES (?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->bind_param("sssss", $url, $detail, $ip, $ua, $time);
    $res = $stmt->execute();

    if($res){
        $arr = array(
            "code" => 200,
            "msg" => "日志记录成功"
        );
    }else{
        $arr = array(
            "code" => 500,
            "msg" => "日志记录失败"
        );
    }
}else{
    $arr = array(
        "code" => 403,
        "msg" => "参数错误，不记录日志"
    );
}

echo json_encode($arr);