<?php
include 'db.php';

$text = $_POST['text'];
$user = $_POST['user'];
$sql = "INSERT INTO msg (msg, user, `state`, `time`) VALUES ('$text', '$user', 'false', NOW())";
$result = mysqli_query($conn, $sql);

if ($result) {
    $arr = array(
        "code" => 200,
        "msg" => "success"
    );
} else {
    $arr = array(
        "code" => 500,
        "msg" => "error"
    );
}

echo json_encode($arr);