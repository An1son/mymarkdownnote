# 🚀 生产力工具 - 个人专属版

一个集成待办清单、番茄钟计时器和Markdown笔记的一体化生产力工具，现在包含专属登录系统。

## ✨ 功能特点

### 🔐 登录系统
- **专属访问**：只有正确的用户名和密码才能访问
- **会话管理**：24小时自动登录，无需重复输入
- **安全保护**：防止未授权访问您的个人数据
- **优雅界面**：现代化的登录页面设计

### 📝 核心功能
- **待办清单**：添加、完成、删除任务，数据本地保存
- **番茄钟**：25分钟工作 + 5分钟休息，提示音提醒
- **Markdown笔记**：实时预览，支持常用语法
- **响应式设计**：完美适配桌面、平板、手机


## 📁 文件结构

```
├── login.html          # 登录页面
├── index.html          # 主应用页面
├── app.js             # 主应用逻辑 + 认证系统
├── style.css          # 样式文件
├── manifest.json      # PWA配置
├── robots.txt         # SEO配置
├── sitemap.xml        # 网站地图
└── README.md          # 说明文档
```

## 🚀 使用方法

### 本地运行
```bash
# 启动本地服务器
python -m http.server 5500

# 访问应用
# 浏览器打开：http://localhost:5500/login.html
```

### 部署上线
1. **购买域名**（推荐 Namecheap、阿里云）
2. **选择托管**（推荐 GitHub Pages 免费方案）
3. **上传文件**到托管平台
4. **配置域名**DNS解析

## 🔒 安全说明

### 当前安全级别
- ✅ 客户端会话管理
- ✅ 24小时自动过期
- ✅ 基本访问控制
- ⚠️ 密码明文存储（仅适合个人使用）

### 生产环境建议
如果要在公网部署，建议：
- 使用服务器端认证
- 密码加密存储
- HTTPS加密传输
- 更复杂的会话管理

## 🎨 自定义配置

### 修改登录信息
编辑 `login.html` 中的配置：
```javascript
const LOGIN_CONFIG = {
    username: 'your_username',    // 修改用户名
    password: 'your_password',    // 修改密码
    sessionKey: 'your_session_key',
    redirectUrl: 'index.html'
};
```

### 修改会话时长
在 `login.html` 和 `app.js` 中修改：
```javascript
expires: new Date().getTime() + (24 * 60 * 60 * 1000) // 24小时
```

## 📱 PWA支持

应用支持安装到桌面：
- Chrome：地址栏右侧的安装图标
- Safari：分享 → 添加到主屏幕
- Edge：设置 → 应用 → 安装此站点

## 🛠️ 技术栈

- **前端**：纯HTML/CSS/JavaScript
- **存储**：localStorage
- **认证**：客户端会话管理
- **样式**：CSS Grid + Flexbox
- **兼容性**：现代浏览器

## 📞 支持

如需修改功能或遇到问题，请：
1. 检查浏览器控制台错误信息
2. 确认localStorage功能正常
3. 验证文件路径正确

## 📄 许可证

个人使用项目，请根据需要调整。

---


**享受高效的工作时光！** 🎯
