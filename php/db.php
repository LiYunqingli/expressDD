<?php
//连接数据库，请注意修改为当前数据库的数据库信息

//读取json文件config.json
$config = json_decode(file_get_contents("./config.json"), true);

$config = $config['MySqlConnect'];
$host = $config['host'];
$username = $config['username'];
$password = $config['password'];
$database = $config['database'];
$port = $config['port'];

// $conn = new mysqli($host, $username, $password, $database);
$conn = new mysqli($host, $username, $password, $database, $port);

// echo json_encode($config);

if ($conn->connect_error) {
    echo("连接失败: " . $conn->connect_error);
}