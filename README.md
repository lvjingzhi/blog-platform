# 📝 博客平台 - 付费内容系统

一个支持付费内容的个人博客平台。博主可以发布和管理文章，读者可以阅读免费内容，并通过模拟支付购买付费内容。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vite |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| HTTP 客户端 | Axios |
| Markdown 渲染 | Marked |
| 后端 | Node.js + Express |
| 数据库 | SQLite (sql.js) |
| 认证 | JWT + bcryptjs |

## 功能特性

- 📝 **文章管理**：创建、编辑、删除文章，支持草稿/发布状态
- 💰 **付费内容**：用 `<!--paid-->` 和 `<!--/paid-->` 标记付费区块
- 🔒 **内容解锁**：未购买时付费内容显示模糊遮罩，购买后自动解锁
- 💳 **模拟支付**：完整的购买流程（确认 → 处理 → 成功），无需真实支付
- 📚 **我的书库**：读者可查看已购买的所有文章
- 🔐 **管理后台**：JWT 认证，安全的文章管理界面
- 📱 **响应式设计**：适配桌面和移动端

## 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn

### 1. 启动后端

```bash
cd server
npm install
npm run dev
```

后端运行在 http://localhost:3001

默认管理员账号：`admin` / `admin123`

### 2. 启动前端

```bash
cd client
npm install
npm run dev
```

前端运行在 http://localhost:5173

### 3. 使用

1. 访问 http://localhost:5173 查看博客首页
2. 访问 http://localhost:5173/admin/login 进入管理后台
3. 在管理后台创建文章，用 `<!--paid-->` 和 `<!--/paid-->` 标记付费内容
4. 在前台查看文章，付费内容会显示模糊遮罩
5. 点击"购买解锁"体验模拟支付流程

## 项目结构

```
blog-platform/
├── server/                         # 后端
│   ├── index.js                    # Express 入口
│   ├── db/
│   │   ├── index.js                # 数据库连接
│   │   ├── migrate.js              # 自动迁移
│   │   └── migrations/
│   │       └── 001_initial.sql     # 建表 SQL
│   ├── middleware/
│   │   ├── requireAdmin.js         # JWT 验证
│   │   └── errorHandler.js         # 错误处理
│   ├── routes/
│   │   ├── auth.js                 # 登录/验证
│   │   ├── posts.js                # 公开文章 API
│   │   ├── adminPosts.js           # 管理端文章 CRUD
│   │   └── purchases.js            # 模拟购买
│   └── utils/
│       ├── jwt.js                  # JWT 工具
│       └── slugify.js             # URL slug 生成
│
├── client/                         # 前端
│   ├── vite.config.js              # Vite 配置（API 代理）
│   └── src/
│       ├── main.js                 # 入口
│       ├── App.vue                 # 根组件
│       ├── router/index.js         # 路由定义
│       ├── stores/                 # Pinia 状态管理
│       ├── layouts/                # 布局组件
│       ├── pages/                  # 页面组件
│       │   ├── reader/             # 读者端页面
│       │   └── admin/              # 管理端页面
│       └── components/             # 可复用组件
│           ├── common/             # 通用组件
│           ├── reader/             # 读者端组件
│           └── admin/              # 管理端组件
└── README.md
```

## API 接口

| 方法 | 路径 | 认证 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 无 | 管理员登录 |
| GET | `/api/auth/me` | Admin | 验证 token |
| GET | `/api/posts` | 无 | 公开文章列表 |
| GET | `/api/posts/:slug` | 无 | 文章详情 |
| GET | `/api/admin/posts` | Admin | 全部文章 |
| POST | `/api/admin/posts` | Admin | 创建文章 |
| PUT | `/api/admin/posts/:id` | Admin | 更新文章 |
| DELETE | `/api/admin/posts/:id` | Admin | 删除文章 |
| POST | `/api/purchases` | 无 | 模拟购买 |
| GET | `/api/purchases/:reader_id` | 无 | 购买记录 |

## 付费内容标记

在文章编辑器中，使用以下标记包裹付费内容：

```markdown
这是所有人都能看到的免费内容。

<!--paid-->
这是需要付费才能阅读的内容。
可以包含多个段落和 Markdown 格式。
<!--/paid-->

这里又是免费内容了。
```

保存后，付费区块会自动解析并存储。前台未购买的用户会看到模糊遮罩。

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 后端端口 | 3001 |
| `ADMIN_PASSWORD` | 管理员初始密码 | admin123 |
| `JWT_SECRET` | JWT 签名密钥 | (内置默认值) |