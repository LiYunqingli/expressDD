# 快递取件快捷记录系统

一个完整的Web应用程序，用于高效管理快递取件记录，包含直观的前端界面和功能完善的后端API。

## ✨ 功能特性

**用户认证系统**
- 双角色登录（管理员/用户）
- JWT Token身份验证
- 自动Token校验
- 安全退出机制

**快递记录管理**
- 快递记录CRUD操作（创建、读取、更新、删除）
- 按日期筛选记录
- 数据导出功能
- 实时统计展示

**智能视图模式**
- 送件模式：按宿舍楼分组排序
- 取件模式：智能分类快递单号（字母开头、数字开头、特殊前缀）
- 编辑模式：记录批量操作

**UI/UX设计**
- 响应式布局适配各种设备
- 模态窗口表单交互
- 实时表单验证
- 交互动画反馈
- 消息通知系统

## 🛠 技术栈

**前端技术**
- HTML5/CSS3
- JavaScript (ES6)
- Material Icons
- XMLHttpRequest

**后端技术**
- PHP 7.0+
- MySQL 5.6+
- RESTful API设计
- JWT身份验证

**数据交互**
- JSON数据格式
- LocalStorage存储Token
- AJAX异步通信

## ⚙️ 安装与部署

### 环境要求
- Web服务器 (Apache/Nginx)
- PHP 7.0+
- MySQL 5.6+

### 部署步骤
1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/express-system.git
   ```
   
2. 创建数据库并导入结构：
   ```sql
   CREATE DATABASE express_db;
   USE express_db;
   -- 创建records表（根据实际SQL结构）
   ```
   
3. 配置后端API：
   在 `js/lib.js` 中设置服务器地址：
   ```javascript
   const $MAIN = "http://your-server-address";
   ```
   
4. 配置数据库连接：
   编辑PHP文件中的数据库连接信息
   
5. 启动服务：
   ```bash
   php -S localhost:1234
   ```
   
6. 访问系统：
   ```
   http://localhost:1234/login.html
   ```

## 📖 使用说明

### 登录系统
1. 输入用户名和密码
2. 选择身份（管理员/用户）
3. 点击"登录"按钮或按Enter键提交

### 主界面操作
- **送快递**：按宿舍楼分组显示快递记录
- **取快递**：智能分类快递单号（字母/数字/特殊前缀）
- **修改记录**：进入编辑模式管理记录
- **新增记录**：点击右上角"+"按钮添加新记录
- **日期筛选**：选择日期查看不同时间记录

### 快捷键
- 登录页：回车键提交表单
- 主界面：双击统计卡片快速退出
- 表单：字段自动填充和验证

## 📄 文件结构

```
express-system/
├── index.html              # 主界面
├── login.html              # 登录页面
├── js/
│   ├── lib.js              # 公共库函数（API配置、Token管理）
│   ├── script.js           # 主业务逻辑（数据渲染、事件处理）
│   └── showMessage.js      # 消息提示组件
├── css/
│   ├── all.main.css       # 基础样式
│   ├── style.css           # 页面样式
│   └── message-box.css     # 消息框样式
└── php/                    # 后端API
    ├── login.php           # 登录处理
    ├── checkToken.php      # Token验证
    ├── getData.php         # 数据获取
    ├── addData.php         # 数据添加
    └── (其他数据库操作文件)
```

## 🌐 API接口文档

### 认证接口
- `POST /php/login.php`
  - 参数: `username`, `password`, `rule`
  - 返回: JWT Token

### 数据接口
- `GET /php/getData.php`
  - 参数: `token`, `type`(日期)
  - 返回: JSON格式快递记录
  
- `POST /php/addData.php`
  - 参数: JSON格式记录数据
  - 返回: 操作状态

### Token验证
- `POST /php/checkToken.php`
  - 参数: `token`
  - 返回: 验证结果

## 📜 开源协议

本项目采用 **MIT License**

```text
MIT License

Copyright (c) 2023 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 贡献指南

欢迎提交Pull Request！请确保：
1. 遵循现有代码风格（ES6语法）
2. 添加详细的代码注释
3. 保持UI设计一致性
4. 更新相关文档

> 提示：后端PHP实现需要配合MySQL数据库使用，完整数据库结构请参考项目Wiki。