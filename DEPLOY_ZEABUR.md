# Zeabur 部署说明

本项目推荐拆分为 3 个服务部署：

1. `health-platform-web`：前端 H5 静态站点
2. `health-platform-api`：Node.js 后端接口
3. `PostgreSQL`：数据库

## 一、部署后端 API

在 Zeabur 新建 `Node.js` 服务：

- Repository：当前仓库
- Root Directory：`server`
- Install Command：`npm install`
- Start Command：`npm run prisma:push && npm start`

建议环境变量：

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://你的前端域名
DATABASE_URL=Zeabur PostgreSQL 提供的连接串
AI_API_KEY=你的 AI Key
AI_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
AI_MODEL=ep-20260415184716-swgsg
```

部署完成后，先访问：

```text
https://你的后端域名/api/health
```

如果返回健康状态，说明后端已可用。

## 二、部署前端 H5

在 Zeabur 新建 `Static Site` 服务：

- Repository：当前仓库
- Root Directory：`/`
- Build Command：`npm install && npm run build:h5`
- Output Directory：`dist/build/h5`

前端环境变量：

```env
VITE_API_BASE_URL=https://你的后端域名/api
```

说明：

- 生产环境前端和后端通常不是同域名，所以一定要显式配置 `VITE_API_BASE_URL`
- 不配置时，前端会默认请求当前站点下的 `/api`，容易导致线上接口请求失败

## 三、创建数据库

在 Zeabur 新建 `PostgreSQL` 服务，然后把数据库连接串填入后端服务的：

```env
DATABASE_URL=...
```

后端启动命令中的：

```bash
npm run prisma:push && npm start
```

会自动把 Prisma 结构推送到数据库。

## 四、推荐上线顺序

1. 先创建 PostgreSQL
2. 再部署后端 API
3. 验证 `GET /api/health`
4. 最后部署前端 H5
5. 打开前端页面，测试上传、看板、报告页、AI 建议

## 五、上线后检查项

- 前端首页可以正常打开，不白屏
- 上传后能创建档案
- 看板可以读取患者数据
- 报告页可以打开
- AI 建议接口正常返回
- 浏览器控制台没有跨域报错

## 六、常见问题

### 1. 前端能打开，但看板没数据

通常是 `VITE_API_BASE_URL` 没配置，或者后端没成功连接数据库。

### 2. 后端启动失败

优先检查：

- `DATABASE_URL` 是否正确
- PostgreSQL 是否已创建
- `npm run prisma:push` 是否执行成功

### 3. 浏览器报跨域

把后端环境变量 `CORS_ORIGIN` 设置为你的前端线上域名，多个域名可用英文逗号分隔。

例如：

```env
CORS_ORIGIN=https://a.zeabur.app,https://b.zeabur.app
```
