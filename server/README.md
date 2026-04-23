# Health Platform Server

适用于 Zeabur 的最小生产后端，提供：

- PostgreSQL 数据存储
- 患者档案与报告保存
- AI 健康建议服务端代理
- 可供前端替换本地存储的 REST API

## 技术栈

- Node.js 18+
- Express
- Prisma
- PostgreSQL
- Zod

## 启动步骤

1. 复制环境变量

```bash
cp .env.example .env
```

2. 安装依赖

```bash
npm install
```

3. 生成 Prisma Client

```bash
npm run prisma:generate
```

4. 推送数据库结构

```bash
npm run prisma:push
```

5. 启动服务

```bash
npm run dev
```

## 主要接口

- `GET /api/health`
- `GET /api/patients`
- `GET /api/patients/:id`
- `POST /api/patients`
- `POST /api/patients/guidance`

## 推荐部署到 Zeabur

- 新建一个 Node 服务，根目录指向 `server`
- 新建一个 PostgreSQL 服务
- 配置环境变量：
  - `PORT`
  - `DATABASE_URL`
  - `CORS_ORIGIN`
  - `AI_API_KEY`
  - `AI_BASE_URL`
  - `AI_MODEL`

## 下一步

当前后端已经可以独立运行，但前端还未切换到调用这些接口。下一步建议：

1. 将 `uni.getStorageSync('health_reports')` 替换为后端接口
2. 将前端 `aiService.js` 改为请求 `/api/patients/guidance`
3. 补充登录鉴权和文件上传
