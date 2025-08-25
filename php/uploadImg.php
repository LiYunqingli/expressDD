<?php
header('Content-Type: application/json');

$response = [
    'success' => false,
    'message' => '未知错误'
];

$token = $_SERVER['HTTP_TOKEN'];
$pid = $_SERVER['HTTP_ID'];

include 'db.php';
include 'lib.php';

if (!checkParm($token)) {
    $response['message'] = 'token未设定，请检查参数';
} else {
    if (($userid = checkToken($token, $conn, '2')) != false) {
        try {
            // 1. 检查是否有文件上传（核心判断）
            if (!isset($_FILES['originalImage']) || !isset($_FILES['compressedImage'])) {
                throw new Exception('未接收到文件');
            }

            $originalFile = $_FILES['originalImage'];
            $compressedFile = $_FILES['compressedImage'];

            // 2. 验证上传是否成功（处理超大小、临时文件错误等）
            if ($originalFile['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('原图上传错误: ' . getUploadErrorMsg($originalFile['error']));
            }
            if ($compressedFile['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('压缩图上传错误: ' . getUploadErrorMsg($compressedFile['error']));
            }

            // 3. 验证文件类型（安全加固：防止伪装图片的恶意文件）
            $allowTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($originalFile['type'], $allowTypes) || !in_array($compressedFile['type'], $allowTypes)) {
                throw new Exception('仅支持JPG、PNG、GIF格式图片');
            }

            // 4. 验证文件大小（可选：限制单文件最大2MB）
            $maxSize = 10 * 1024 * 1024; // 2MB
            if ($originalFile['size'] > $maxSize || $compressedFile['size'] > $maxSize) {
                throw new Exception('图片大小不能超过10MB');
            }

            // 5. 创建上传目录（优化权限：0755比0777更安全）
            $uploadDir = 'uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true); // 0755：所有者可写，其他只读
            }

            // 6. 生成唯一文件名（避免覆盖）
            $originalExt = pathinfo($originalFile['name'], PATHINFO_EXTENSION);
            $compressedExt = pathinfo($compressedFile['name'], PATHINFO_EXTENSION);
            $originalName = uniqid() . '_original.' . $originalExt;
            $compressedName = uniqid() . '_compressed.' . $compressedExt;

            // 7. 移动临时文件到目标目录
            $originalDest = $uploadDir . $originalName;
            $compressedDest = $uploadDir . $compressedName;
            if (
                move_uploaded_file($originalFile['tmp_name'], $originalDest) &&
                move_uploaded_file($compressedFile['tmp_name'], $compressedDest)
            ) {
                $sqlInsert = "INSERT INTO upload_img(pid, original, compressed, userid, upload_time, backup_y_n) VALUES('$pid', '$originalName','$compressedName', '$userid', NOW(), 'false')";
                $insertResult = $conn->query($sqlInsert);
                // 2. 执行UPDATE语句（仅当INSERT成功时）
                if ($insertResult) {
                    $sqlUpdate = "UPDATE `data` SET `status` = '待分享' WHERE id = '$pid'";
                    $updateResult = $conn->query($sqlUpdate);

                    if ($updateResult) {
                        // 两条语句都执行成功
                        $response['success'] = true;
                        $response['message'] = '文件上传成功，状态已更新';
                        $response['files'] = [
                            'original' => $originalName,
                            'compressed' => $compressedName,
                            'originalUrl' => $uploadDir . $originalName,
                            'compressedUrl' => $uploadDir . $compressedName
                        ];
                    } else {
                        // INSERT成功，但UPDATE失败
                        $response['message'] = '文件上传成功，但状态更新失败: ' . $conn->error;
                    }
                } else {
                    // INSERT失败
                    $response['message'] = '数据库插入失败: ' . $conn->error;
                    //删除已上传的文件
                    unlink($uploadDir . $originalName);
                    unlink($uploadDir . $compressedName);
                }
            } else {
                throw new Exception('文件移动失败（可能是目录权限不足）');
            }

        } catch (Exception $e) {
            $response['message'] = $e->getMessage();
        }

        // 辅助函数：将上传错误码转为可读信息
        function getUploadErrorMsg($errorCode)
        {
            $errorMsg = [
                UPLOAD_ERR_INI_SIZE => '文件超过PHP配置的最大限制',
                UPLOAD_ERR_FORM_SIZE => '文件超过表单指定的最大限制',
                UPLOAD_ERR_PARTIAL => '文件仅部分上传',
                UPLOAD_ERR_NO_FILE => '未上传文件',
                UPLOAD_ERR_NO_TMP_DIR => '缺少临时文件夹',
                UPLOAD_ERR_CANT_WRITE => '文件写入失败',
                UPLOAD_ERR_EXTENSION => '文件上传被扩展阻止'
            ];
            return $errorMsg[$errorCode] ?? '未知错误（错误码：' . $errorCode . '）';
        }
    } else {
        $response['message'] = 'token非法，请重新登录';
    }
}
echo json_encode($response);

?>