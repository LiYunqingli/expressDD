<?php

// Upload a remark image for "notes" when adding data

header('Content-Type: application/json');

include 'db.php';
include 'lib.php';

$token = isset($_SERVER['HTTP_TOKEN']) ? $_SERVER['HTTP_TOKEN'] : '';

if (!checkParm($token)) {
    echo json_encode([
        'code' => 400,
        'msg' => '缺少令牌',
        'data' => []
    ]);
    exit;
}

if (($userid = checkToken($token, $conn, '2')) == false) {
    echo json_encode([
        'code' => 401,
        'msg' => '令牌错误',
        'data' => []
    ]);
    exit;
}

try {
    if (!isset($_FILES['image'])) {
        throw new Exception('未接收到文件');
    }

    $file = $_FILES['image'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('上传错误: ' . $file['error']);
    }

    $allowTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowTypes)) {
        throw new Exception('仅支持 JPG/PNG/GIF/WEBP');
    }

    $maxSize = 10 * 1024 * 1024; // 10MB
    if ($file['size'] > $maxSize) {
        throw new Exception('图片大小不能超过10MB');
    }

    $uploadDir = 'uploads_notes/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    if ($ext === '') {
        // fallback by mime
        $ext = 'jpg';
    }

    $filename = uniqid('note_', true) . '.' . $ext;
    $dest = $uploadDir . $filename;

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        throw new Exception('文件移动失败（可能是目录权限不足）');
    }

    echo json_encode([
        'code' => 200,
        'msg' => '上传成功',
        'data' => [
            'filename' => $filename,
            'url' => $uploadDir . $filename
        ]
    ]);
} catch (Exception $e) {
    echo json_encode([
        'code' => 500,
        'msg' => $e->getMessage(),
        'data' => []
    ]);
}

?>
