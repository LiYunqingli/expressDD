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
            // 1. 检查是否有文件上传

            // 有原图版本
            // if (!isset($_FILES['originalImage']) || !isset($_FILES['compressedImage'])) {
            //     throw new Exception('未接收到文件');
            // }

            if (!isset($_FILES['compressedImage'])) {
                throw new Exception('未接收到文件');
            }

            // $originalFile = $_FILES['originalImage']; //去掉原图
            $compressedFile = $_FILES['compressedImage'];

            // 2. 验证上传是否成功
            // if ($originalFile['error'] !== UPLOAD_ERR_OK) {
            //     throw new Exception('原图上传错误: ' . getUploadErrorMsg($originalFile['error']));
            // }
            if ($compressedFile['error'] !== UPLOAD_ERR_OK) {
                throw new Exception('压缩图上传错误: ' . getUploadErrorMsg($compressedFile['error']));
            }

            // 3. 验证文件类型
            $allowTypes = ['image/jpeg', 'image/png', 'image/gif'];

            // 有原图版本
            // if (!in_array($originalFile['type'], $allowTypes) || !in_array($compressedFile['type'], $allowTypes)) {
            //     throw new Exception('仅支持JPG、PNG、GIF格式图片');
            // }

            if (!in_array($compressedFile['type'], $allowTypes)) {
                throw new Exception('仅支持JPG、PNG、GIF格式图片');
            }

            // 4. 验证文件大小
            $maxSize = 10 * 1024 * 1024; // 10MB
            // 有原图版本
            // if ($originalFile['size'] > $maxSize || $compressedFile['size'] > $maxSize) {
            //     throw new Exception('图片大小不能超过10MB');
            // }

            if ($compressedFile['size'] > $maxSize) {
                throw new Exception('图片大小不能超过10MB');
            }

            // 5. 创建上传目录
            $uploadDir = 'uploads/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // 6. 生成唯一文件名
            // $originalExt = pathinfo($originalFile['name'], PATHINFO_EXTENSION);
            $compressedExt = pathinfo($compressedFile['name'], PATHINFO_EXTENSION);
            // $originalName = uniqid() . '_original.' . $originalExt;
            $compressedName = uniqid() . '_compressed.' . $compressedExt;

            // 7. 移动临时文件到目标目录
            // $originalDest = $uploadDir . $originalName;
            $compressedDest = $uploadDir . $compressedName;

            //有原图版本
            // if (
            //     move_uploaded_file($originalFile['tmp_name'], $originalDest) &&
            //     move_uploaded_file($compressedFile['tmp_name'], $compressedDest)
            // )

            if (move_uploaded_file($compressedFile['tmp_name'], $compressedDest)) {
                // 获取原始记录的信息
                $sql = "SELECT * FROM `data` WHERE `id` = '$pid'";
                $result = $conn->query($sql);
                $row = $result->fetch_assoc();
                $time = $row['time'];
                $time = date('Y-m-d', strtotime($time));
                $building = $row['building'];
                $room = $row['room'];

                // 查询所有符合条件的记录
                $sql = "SELECT id FROM `data` WHERE DATE(`time`) = '$time' AND building = '$building' AND room = '$room' AND `status` = '未送达'";
                $result = $conn->query($sql);
                $ids = array();

                if ($result->num_rows > 0) {
                    // 收集所有符合条件的ID
                    while ($row = $result->fetch_assoc()) {
                        $ids[] = $row['id'];
                    }

                    // 插入多条图片记录
                    $sql_old = "INSERT INTO upload_img(pid, original, compressed, userid, upload_time, backup_y_n) VALUES";
                    foreach ($ids as $id) {
                        // 有原图版本
                        // $sql_old .= "('$id', '$originalName','$compressedName', '$userid', NOW(), 'false'),";
                        $sql_old .= "('$id', '','$compressedName', '$userid', NOW(), 'false'),";
                    }
                    $sqlInsert = rtrim($sql_old, ',');
                    $insertResult = $conn->query($sqlInsert);

                    // 更新所有符合条件记录的状态
                    if ($insertResult) {
                        $idsStr = implode(',', $ids);
                        $sqlUpdate = "UPDATE `data` SET `status` = '待分享' WHERE id IN ($idsStr)";
                        $updateResult = $conn->query($sqlUpdate);

                        if ($updateResult) {
                            $response['success'] = true;
                            $response['message'] = '文件上传成功，' . count($ids) . '条记录状态已更新';
                            $response['updated_ids'] = $ids;
                            $response['files'] = [
                                // 'original' => $originalName,
                                'compressed' => $compressedName,
                                // 'originalUrl' => $uploadDir . $originalName,
                                'compressedUrl' => $uploadDir . $compressedName
                            ];
                        } else {
                            $response['message'] = '文件上传成功，但状态更新失败: ' . $conn->error;
                        }
                    } else {
                        $response['message'] = '数据库插入失败: ' . $conn->error;
                        // 删除已上传的文件
                        unlink($uploadDir . $originalName);
                        unlink($uploadDir . $compressedName);
                    }
                } else {
                    // 只插入一条图片记录

                    //有原图版本
                    // $sqlInsert = "INSERT INTO upload_img(pid, original, compressed, userid, upload_time, backup_y_n) VALUES('$pid', '$originalName','$compressedName', '$userid', NOW(), 'false')";
                    $sqlInsert = "INSERT INTO upload_img(pid, original, compressed, userid, upload_time, backup_y_n) VALUES('$pid', '','$compressedName', '$userid', NOW(), 'false')";
                    $insertResult = $conn->query($sqlInsert);

                    // 只更新一条记录的状态
                    if ($insertResult) {
                        $sqlUpdate = "UPDATE `data` SET `status` = '待分享' WHERE id = '$pid'";
                        $updateResult = $conn->query($sqlUpdate);

                        if ($updateResult) {
                            $response['success'] = true;
                            $response['message'] = '文件上传成功，状态已更新';
                            $response['updated_ids'] = [$pid];
                            $response['files'] = [
                                // 'original' => $originalName,
                                'compressed' => $compressedName,
                                // 'originalUrl' => $uploadDir . $originalName,
                                'compressedUrl' => $uploadDir . $compressedName
                            ];
                        } else {
                            $response['message'] = '文件上传成功，但状态更新失败: ' . $conn->error;
                        }
                    } else {
                        $response['message'] = '数据库插入失败: ' . $conn->error;
                        // 删除已上传的文件
                        // unlink($uploadDir . $originalName);
                        unlink($uploadDir . $compressedName);
                    }
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