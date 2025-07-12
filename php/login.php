<?php

#登录接口

include 'db.php';
include 'lib.php';

$rule = $_POST['rule'];

$errData = array(
    "code" => 400,
    "msg" => "参数错误",
    "token" => ""
);


if (checkParm($rule)) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    if (checkParm($username) && checkParm($password)) {
        $sql = "SELECT * FROM users WHERE userid = '$username' AND password = '$password'";
        $result = $conn->query($sql);
        if ($result->num_rows > 0) {
            $token = createToken($username, $password);//生成token
            $arr = array(
                "code" => 200,
                "msg" => "登录成功",
                "token" => $token,
                "username" => $username,
                "password"=> $password
            );
        } else {
            $arr = array(
                "code" => 402,
                "msg" => "用户名或密码错误",
                "token" => ""
            );
        }
    } else {
        $arr = $errData;//400
    }
} else {
    $arr = $errData;//400
}

echo json_encode($arr);
