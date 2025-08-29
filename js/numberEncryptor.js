const key = "Aa123456";

// 加密函数
function encrypt(number) {
    // 将数字转换为字符串
    let numStr = number.toString();
    let encrypted = "";

    // 使用密钥对每个数字进行变换
    for (let i = 0; i < numStr.length; i++) {
        // 获取数字
        const digit = parseInt(numStr[i]);
        // 使用密钥对应位置的字符编码进行变换
        const keyCharCode = key.charCodeAt(i % key.length);
        // 进行简单的数学运算
        const transformed = (digit * 5 + keyCharCode % 10 + 10);
        // 转换为36进制（包含字母），并确保是2位长度
        let encryptedPart = transformed.toString(36);
        // 填充0确保固定2位长度
        if (encryptedPart.length === 1) {
            encryptedPart = '0' + encryptedPart;
        }
        encrypted += encryptedPart;
    }

    // 添加随机字母增加复杂性
    const randomChar = () => Math.random().toString(36).substr(2, 1);
    return randomChar() + encrypted + randomChar();
}

// 解密函数
function decrypt(cipherText) {
    try {
        // 移除首尾的随机字符
        const text = cipherText.slice(1, -1);

        // 检查长度是否为偶数
        if (text.length % 2 !== 0) {
            throw new Error("无效的密文长度");
        }

        let decrypted = "";

        // 解析加密文本 - 每2个字符为一组
        for (let i = 0; i < text.length; i += 2) {
            // 提取两个字符
            const part = text.substr(i, 2);
            // 转换回十进制数字
            const encryptedNum = parseInt(part, 36);
            // 使用密钥对应位置的字符编码进行反向变换
            const keyCharCode = key.charCodeAt((i / 2) % key.length);
            // 反向数学运算
            const originalDigit = (encryptedNum - 10 - keyCharCode % 10) / 5;

            // 检查结果是否为整数
            if (!Number.isInteger(originalDigit) || originalDigit < 0 || originalDigit > 9) {
                throw new Error("无效的密文");
            }

            decrypted += originalDigit.toString();
        }

        return decrypted;
    } catch (error) {
        console.error("解密失败:", error.message);
        return false;
    }
}

// 测试代码
// const testNumber = 123456;
// const encrypted = encrypt(testNumber);
// console.log("加密后:", encrypted);

// const decrypted = decrypt(encrypted);
// console.log("解密后:", decrypted);
// console.log("解密是否正确:", decrypted === testNumber.toString());
