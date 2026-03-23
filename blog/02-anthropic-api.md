---
title: anthropic-api
---

# Anthropic API 实战：构建你的第一个 AI Agent

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在构建 AI Agent 时，选择合适的 API 是成功的关键。作为一名深耕 Agent 开发的工程师，我深度使用过 OpenAI、Anthropic、Google Gemini 等多个平台的 API。经过大量实践，我发现 Anthropic API 在 Agent 开发方面有几个独特优势：更长的上下文窗口、更稳定的输出、以及专为工具调用设计的 Messages API。本文将带你从零开始，使用 Anthropic API 构建一个完整的 AI Agent。

## 核心概念

### Messages API 基础

Anthropic 的 Messages API 是与 Claude 交互的核心接口。与传统的 chat completion API 不同，Messages API 专为多轮对话和工具调用设计。

### 基本请求结构

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: [
    {
      role: 'user',
      content: '你好，Claude！'
    }
  ]
});
~~~

### 工具调用 (Tool Use)

这是 Agent 开发中最强大的功能。Claude 可以主动调用你定义的工具：

```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  tools: [
    {
      name: 'get_weather',
      description: '获取指定城市的天气信息',
      input_schema: {
        type: 'object',
        properties: {
          city: {
            type: 'string',
            description: '城市名称'
          },
          unit: {
            type: 'string',
            enum: ['celsius', 'fahrenheit'],
            description: '温度单位'
          }
        },
        required: ['city']
      }
    }
  ],
  messages: [
    {
      role: 'user',
      content: '北京今天天气怎么样？'
    }
  ]
});

// Claude 会返回 tool_use 类型的响应
if (message.stop_reason === 'tool_use') {
  const toolUse = message.content.find(block => block.type === 'tool_use');
  // 执行工具调用...
}
~~~

### Agent 循环

一个完整的 Agent 需要实现请求-响应循环：

~~~
┌─────────────┐
│   用户输入   │
└──────┬──────┘
       ▼
┌─────────────┐     ┌──────────────┐
│ 发送到 Claude │────▶│  Claude 决策  │
└─────────────┘     └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │ 需要工具调用？ │
                    └──────┬───────┘
                      是 │      │ 否
                         ▼      ▼
                   ┌─────────┐ ┌──────────┐
                   │执行工具  │ │返回响应  │
                   └────┬────┘ └────┬─────┘
                        │          │
                        └────┬─────┘
                             ▼
                      ┌─────────────┐
                      │ 继续对话循环 │
                      └─────────────┘
~~~

## 实战示例

### 完整的 Agent 实现

让我们构建一个实用的代码审查 Agent：

```typescript
import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface ToolResult {
  content: string;
  isError?: boolean;
}

class CodeReviewAgent {
  private client: Anthropic;
  private conversationHistory: any[] = [];

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  // 定义工具
  private tools = [
    {
      name: 'read_file',
      description: '读取文件内容',
      input_schema: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: '文件路径'
          }
        },
        required: ['path']
      }
    },
    {
      name: 'list_files',
      description: '列出目录中的文件',
      input_schema: {
        type: 'object',
        properties: {
          directory: {
            type: 'string',
            description: '目录路径'
          },
          pattern: {
            type: 'string',
            description: '文件匹配模式（如 *.ts）'
          }
        },
        required: ['directory']
      }
    },
    {
      name: 'search_code',
      description: '在代码中搜索模式',
      input_schema: {
        type: 'object',
        properties: {
          pattern: {
            type: 'string',
            description: '搜索模式'
          },
          filePattern: {
            type: 'string',
            description: '文件模式'
          }
        },
        required: ['pattern', 'filePattern']
      }
    }
  ];

  // 工具执行器
  private async executeTool(toolName: string, input: any): Promise<ToolResult> {
    try {
      switch (toolName) {
        case 'read_file':
          const content = readFileSync(input.path, 'utf-8');
          return { content };

        case 'list_files':
          const files = readdirSync(input.directory);
          const filtered = input.pattern
            ? files.filter(f => f.match(input.pattern))
            : files;
          return { content: JSON.stringify(filtered, null, 2) };

        case 'search_code':
          // 实现 grep 搜索
          const { execSync } = require('child_process');
          const result = execSync(
            `grep -r "${input.pattern}" --include="${input.filePattern}" .`,
            { encoding: 'utf-8', cwd: process.cwd() }
          );
          return { content: result || '未找到匹配' };

        default:
          return { content: `未知工具: ${toolName}`, isError: true };
      }
    } catch (error) {
      return {
        content: `执行错误: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      };
    }
  }

  // 主运行循环
  async run(userMessage: string, maxIterations: number = 10): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage
    });

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // 发送请求到 Claude
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        tools: this.tools,
        messages: this.conversationHistory
      });

      // 处理响应
      const assistantMessage: any = {
        role: 'assistant',
        content: response.content
      };
      this.conversationHistory.push(assistantMessage);

      // 检查是否需要工具调用
      const toolUseBlocks = response.content.filter(
        (block: any) => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) {
        // 没有 tool_use，返回最终响应
        const textBlock = response.content.find(
          (block: any) => block.type === 'text'
        );
        return textBlock?.text || '无响应';
      }

      // 执行所有工具调用
      for (const block of toolUseBlocks) {
        const result = await this.executeTool(block.name, block.input);
        this.conversationHistory.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: block.id,
              content: result.content,
              is_error: result.isError
            }
          ]
        });
      }
    }

    return '达到最大迭代次数';
  }

  // 重置对话
  reset() {
    this.conversationHistory = [];
  }
}

// 使用示例
async function main() {
  const agent = new CodeReviewAgent(process.env.ANTHROPIC_API_KEY!);

  const result = await agent.run(
    '请审查 src/auth.ts 文件的安全性，检查常见漏洞并提供修复建议'
  );

  console.log(result);
}

main();
~~~

### 流式响应

对于实时交互，使用流式 API：

```typescript
async function streamChat() {
  const stream = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    messages: [{ role: 'user', content: '解释什么是 Agent' }],
    stream: true
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta') {
      process.stdout.write(event.delta.text);
    }
  }
}
~~~

### 系统提示词优化

好的系统提示词是 Agent 成功的关键：

```typescript
const systemPrompt = `你是一个专业的代码审查助手，专注于安全性和代码质量。

审查时重点关注：
1. 安全漏洞（SQL 注入、XSS、认证问题等）
2. 性能问题
3. 代码可读性和可维护性
4. 最佳实践违反

输出格式：
## 发现的问题
- 🔴 严重
- 🟡 警告
- 🔵 建议

## 修复建议
提供具体的代码示例

始终保持客观、建设性的语气。`;

const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  system: systemPrompt,
  messages: [{ role: 'user', content: '审查这段代码...' }]
});
~~~

## 最佳实践

### 1. 错误处理

始终实现健壮的错误处理：

```typescript
class APIClient {
  async callWithRetry(fn: () => Promise<any>, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error.status === 429 && i < maxRetries - 1) {
          // 速率限制，等待后重试
          const waitTime = Math.pow(2, i) * 1000;
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
        throw error;
      }
    }
  }
}
~~~

### 2. Token 管理

监控和优化 Token 使用：

```typescript
function estimateTokens(text: string): number {
  // 粗略估算：1 token ≈ 4 字符
  return Math.ceil(text.length / 4);
}

class TokenAwareAgent {
  private maxTokens = 100000;
  private usedTokens = 0;

  shouldContinue(): boolean {
    return this.usedTokens < this.maxTokens * 0.8; // 留 20% 余量
  }

  async sendMessage(message: string) {
    if (!this.shouldContinue()) {
      this.summarizeContext(); // 压缩上下文
    }

    const tokens = estimateTokens(message);
    this.usedTokens += tokens;

    return await anthropic.messages.create({...});
  }

  private summarizeContext() {
    // 实现上下文压缩逻辑
  }
}
~~~

### 3. 并发工具执行

当多个工具调用独立时，并发执行：

```typescript
async function executeToolsParallel(toolCalls: any[]) {
  const results = await Promise.all(
    toolCalls.map(async (call) => {
      return await executeTool(call.name, call.input);
    })
  );
  return results;
}
~~~

### 4. 上下文窗口管理

Claude 3.5 Sonnet 支持 200K 上下文，但仍需高效管理：

```typescript
class ContextManager {
  private messages: any[] = [];
  private maxTokens = 150000; // 留出余量

  addMessage(message: any) {
    this.messages.push(message);
    this.pruneIfNeeded();
  }

  private pruneIfNeeded() {
    while (this.estimateTotalTokens() > this.maxTokens) {
      // 移除最旧的非系统消息
      const oldestIndex = this.messages.findIndex(
        m => m.role !== 'system'
      );
      if (oldestIndex >= 0) {
        this.messages.splice(oldestIndex, 1);
      } else {
        break;
      }
    }
  }

  private estimateTotalTokens(): number {
    return this.messages.reduce((sum, m) => {
      return sum + estimateTokens(JSON.stringify(m));
    }, 0);
  }
}
~~~

### 5. 安全实践

```typescript
// 验证工具输入
function validateToolInput(toolName: string, input: any): boolean {
  // 防止路径遍历
  if (input.path && input.path.includes('..')) {
    return false;
  }

  // 验证枚举值
  if (input.unit && !['celsius', 'fahrenheit'].includes(input.unit)) {
    return false;
  }

  return true;
}

// 限制敏感操作
const dangerousTools = ['delete_file', 'execute_command'];
function requireConfirmation(toolName: string): boolean {
  return dangerousTools.includes(toolName);
}
~~~

### 6. 测试策略

```typescript
describe('CodeReviewAgent', () => {
  it('should detect SQL injection vulnerability', async () => {
    const agent = new CodeReviewAgent('test-key');
    const code = `
      const query = "SELECT * FROM users WHERE id = " + userId;
    `;

    const result = await agent.run(`审查这段代码：\n${code}`);

    expect(result).toContain('SQL 注入');
  });

  it('should handle tool execution failures', async () => {
    const agent = new CodeReviewAgent('test-key');
    // 测试错误处理...
  });
});
~~~

### 7. 性能优化

```typescript
// 缓存频繁使用的结果
class ResponseCache {
  private cache = new Map<string, any>();

  get(key: string): any | null {
    return this.cache.get(key) || null;
  }

  set(key: string, value: any, ttl = 3600000) {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl);
  }
}

// 批量处理
async function batchProcess(items: string[], batchSize = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  return results;
}
~~~

## 高级主题

### 多模态输入

```typescript
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: fs.readFileSync('screenshot.png', 'base64')
        }
      },
      {
        type: 'text',
        text: '这个 UI 有什么问题？'
      }
    ]
  }]
});
~~~

### 结构化输出

```typescript
// 使用 JSON 模式确保结构化输出
const response = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 4096,
  messages: [{
    role: 'user',
    content: '分析这段代码，返回 JSON 格式的报告'
  }],
  // 启用 JSON 输出
  response_format: { type: 'json_object' }
});
~~~

## 参考资料

- [Anthropic API 官方文档](https://docs.anthropic.com/en/api/getting-started)
- [Messages API 参考](https://docs.anthropic.com/en/api/messages)
- [工具使用指南](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview)
- [流式响应文档](https://docs.anthropic.com/en/api/streaming)

---

**下一篇**：[Agent Swarm 架构模式：多协作系统设计](./03-agent-swarm.md)
