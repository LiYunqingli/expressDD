<?php

// 获取管理员列表（用于数据分析）


include 'db.php';
include 'lib.php';

if(checkParm($_POST['token'])){
    $token = $_POST['token'];

    if(checkToken($token, $conn)){
        $sql = "SELECT userid FROM users";
        $result = $conn->query($sql);
        if($result->num_rows > 0){
            $userList = array();
            while($row = $result->fetch_assoc()){
                array_push($userList, $row['userid']);
            }
            $arr = array(
                "code" => 200,
                "msg" => "查询成功",
                "data" => $userList
            );
        }else{
            $arr = array(
                "code" => 201,
                "msg" => "查询成功，但是用户列表为空",
                "data" => []
            );
        }
    }else{
        $arr = array(
            "code" => 403,
            "msg" => "token非法或者已过期",
            "data" => []
        );
    }

}else{
    $arr = array(
        "code" => 401,
        "msg" => "参数错误，缺少token",
        "data" => []
    );
}

echo json_encode($arr);