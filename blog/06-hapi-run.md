---
title: hapi-run
---

# Hapi.run 平台实战：快速部署 AI 应用

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

作为 Agent 开发者，我最大的痛点之一是：**如何快速将 AI 应用部署到生产环境？** 传统部署流程繁琐——配置服务器、设置环境变量、配置反向代理、监控日志……

直到我发现了 Hapi.run。这是一个专为 AI 应用设计的部署平台，让我可以在几分钟内将 Agent 应用从本地开发环境部署到生产环境。本文将详细介绍如何使用 Hapi.run 部署你的 AI Agent 应用。

## 核心概念

### 什么是 Hapi.run？

Hapi.run 是一个云平台，专门用于部署和托管 AI 应用。它提供了：

1. **一键部署**：从 Git 仓库直接部署
2. **自动扩展**：根据负载自动调整资源
3. **内置监控**：实时监控应用性能和成本
4. **API 管理**：自动生成 API 文档和密钥管理
5. **多模型支持**：轻松切换不同的 AI 模型

### 架构概览

~~~
┌─────────────────────────────────────────────────────────┐
│                    Hapi.run Platform                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Deployment Layer                      │  │
│  │  • Git Integration  • CI/CD  • Rollback          │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Runtime Layer                        │  │
│  │  • Container Orchestration  • Auto Scaling        │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              AI Model Layer                       │  │
│  │  • Claude  • GPT-4  • Gemini  • Llama            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
~~~

## 实战示例

### 项目准备

首先，准备一个标准的 Node.js Agent 项目：

```bash
# 创建项目目录
mkdir my-agent-app
cd my-agent-app

# 初始化项目
npm init -y

# 安装依赖
npm install @anthropic-ai/sdk express
npm install -D typescript @types/node @types/express
~~~

### 项目结构

~~~
my-agent-app/
├── src/
│   ├── index.ts          # 应用入口
│   ├── agent.ts          # Agent 实现
│   └── skills/           # 技能目录
│       └── code-review.ts
├── hapi.config.ts        # Hapi.run 配置
├── package.json
├── tsconfig.json
└── .env.example
~~~

### Agent 实现

```typescript
// src/agent.ts
import Anthropic from '@anthropic-ai/sdk';

export class Agent {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }

  async chat(message: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: message }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.text || '';
  }

  async streamChat(message: string): Promise<AsyncIterable<string>> {
    const stream = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: message }],
      stream: true
    });

    return (async function* () {
      for await (const event of stream) {
        if (event.type === 'content_block_delta') {
          yield event.delta.text;
        }
      }
    })();
  }
}
~~~

### HTTP API

```typescript
// src/index.ts
import express from 'express';
import { Agent } from './agent';

const app = express();
app.use(express.json());

const agent = new Agent();

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// 聊天端点
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await agent.chat(message);
    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// 流式聊天端点
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await agent.streamChat(message);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
~~~

### Hapi.run 配置

```typescript
// hapi.config.ts
export default {
  name: 'my-agent-app',
  version: '1.0.0',

  // 环境变量
  env: {
    ANTHROPIC_API_KEY: {
      description: 'Anthropic API 密钥',
      required: true
    },
    PORT: {
      description: '应用端口',
      default: '3000'
    }
  },

  // 构建配置
  build: {
    command: 'npm run build',
    output: 'dist'
  },

  // 启动配置
  start: {
    command: 'npm start'
  },

  // 资源配置
  resources: {
    cpu: '0.5',
    memory: '512Mi'
  },

  // 自动扩展配置
  autoscaling: {
    minInstances: 1,
    maxInstances: 10,
    targetCpuUtilization: 70
  },

  // 监控配置
  monitoring: {
    enabled: true,
    alerts: [
      {
        name: 'high-error-rate',
        condition: 'error_rate > 5%',
        action: 'notify'
      },
      {
        name: 'high-latency',
        condition: 'p95_latency > 5000ms',
        action: 'scale'
      }
    ]
  }
};
~~~

### package.json 配置

```json
{
  "name": "my-agent-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "hapi:deploy": "hapi deploy",
    "hapi:logs": "hapi logs",
    "hapi:status": "hapi status"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
~~~

### 部署流程

#### 1. 安装 Hapi CLI

```bash
npm install -g @hapi/cli
# 或
yarn global add @hapi/cli
~~~

#### 2. 登录

```bash
hapi login
~~~

#### 3. 初始化项目

```bash
hapi init
~~~

这会创建 `hapi.config.ts` 文件。

#### 4. 配置环境变量

```bash
# 在 Hapi.run 控制台设置环境变量
# 或使用 CLI
hapi env set ANTHROPIC_API_KEY=your_api_key
~~~

#### 5. 部署

```bash
# 首次部署
hapi deploy

# 或指定环境
hapi deploy --env production
~~~

#### 6. 查看部署状态

```bash
hapi status

# 输出示例
# App: my-agent-app
# Status: Running
# URL: https://my-agent-app.hapi.run
# Instances: 2/10
# CPU: 35%
# Memory: 256Mi/512Mi
~~~

### 部署后测试

```bash
# 健康检查
curl https://my-agent-app.hapi.run/health

# 聊天测试
curl -X POST https://my-agent-app.hapi.run/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}'

# 流式聊天测试
curl -X POST https://my-agent-app.hapi.run/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "介绍一下你自己"}'
~~~

## 高级功能

### 自定义域名

```typescript
// hapi.config.ts
export default {
  // ...其他配置
  domain: {
    custom: 'agent.mydomain.com',
    ssl: true // 自动配置 SSL
  }
};
~~~

### 多环境部署

```bash
# 开发环境
hapi deploy --env development

# 预发布环境
hapi deploy --env staging

# 生产环境
hapi deploy --env production
~~~

### 版本回滚

```bash
# 查看部署历史
hapi deployments

# 回滚到指定版本
hapi rollback <deployment-id>
~~~

### 监控和日志

```bash
# 实时日志
hapi logs --follow

# 过滤日志
hapi logs --filter "error"

# 查看指标
hapi metrics
~~~

### Webhook 配置

```typescript
// hapi.config.ts
export default {
  // ...其他配置
  webhooks: [
    {
      url: 'https://hooks.slack.com/services/...',
      events: ['deployment.success', 'deployment.failed']
    },
    {
      url: 'https://api.example.com/webhook',
      events: ['alert.high_error_rate'],
      headers: {
        'Authorization': 'Bearer your-token'
      }
    }
  ]
};
~~~

## 最佳实践

### 1. 环境变量管理

```typescript
// .env.example
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here
REDIS_URL=your_redis_url_here

// 永远不要提交实际的 .env 文件到版本控制
echo ".env" >> .gitignore
~~~

### 2. 健康检查

```typescript
// 添加详细的健康检查端点
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      api: await checkApiHealth(),
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth()
    }
  };

  const allHealthy = Object.values(health.checks).every(v => v === 'ok');
  res.status(allHealthy ? 200 : 503).json(health);
});
~~~

### 3. 优雅关闭

```typescript
const shutdown = async () => {
  console.log('Shutting down gracefully...');

  // 停止接受新请求
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // 30 秒后强制关闭
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
~~~

### 4. 请求日志

```typescript
import morgan from 'morgan';

app.use(morgan('combined'));
~~~

### 5. 错误处理

```typescript
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
~~~

### 6. API 限流

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 限制每个 IP 100 个请求
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
~~~

## 成本优化

### 1. 合理设置资源限制

```typescript
// hapi.config.ts
resources: {
  cpu: '0.25',    // 根据实际需求调整
  memory: '256Mi' // 从小开始，逐步增加
}
~~~

### 2. 使用预留实例

```typescript
autoscaling: {
  minInstances: 1, // 保持至少一个实例运行以避免冷启动
  maxInstances: 5,
  targetCpuUtilization: 70
}
~~~

### 3. 启用缓存

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 分钟缓存

app.get('/api/info', async (req, res) => {
  const cacheKey = 'info';

  let info = cache.get(cacheKey);
  if (!info) {
    info = await fetchInfo();
    cache.set(cacheKey, info);
  }

  res.json(info);
});
~~~

## 参考资料

- [Hapi.run 官方文档](https://hapi.run/docs)
- [部署最佳实践](https://hapi.run/docs/best-practices)
- [监控和调试](https://hapi.run/docs/monitoring)

---

**下一篇**：[LangChain vs 原生开发：Agent 框架选型](./07-langchain-vs-native.md)
