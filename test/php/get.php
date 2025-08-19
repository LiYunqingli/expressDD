<?php
include 'db.php';
include 'lib.php';
$time = $_POST['time'];
$token = $_POST['token'];
// 添加排序确保按时间顺序返回

if (($userid = checkToken($token, $conn, "2")) != false) {
    $user = $userid;
    $sql = "SELECT * FROM msg WHERE time > '$time' AND user = '$user' AND `state` = 'false' ORDER BY time ASC";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        $arr = array(
            "code" => 200,
            "msg" => "have new msg",
            "data" => $data
        );

        //刷新已读状态
        $sql = "UPDATE msg SET state = 'true' WHERE time > '$time' AND user = '$user'";
        $conn->query($sql);
    } else {
        $arr = array(
            "code" => 201,
            "msg" => "0 lines",
            "data" => []
        );
    }
    $conn->close();
} else {
    $arr = array(
        "code" => 202,
        "msg" => "令牌错误，请重新登录",
        "data" => []
    );
}


echo json_encode($arr);