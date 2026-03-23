---
title: langchain-vs-native
---

# LangChain vs 原生开发：Agent 框架选型

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在开始构建 AI Agent 时，我面临一个重要决策：**使用 LangChain 这样的框架，还是直接调用 API 原生开发？**

LangChain 提供了丰富的抽象和工具，可以快速启动。但随着项目复杂度增加，我发现框架的限制也逐渐显现。另一方面，原生开发提供了最大的灵活性，但需要处理更多底层细节。

经过多个项目的实践，我总结出了这套选型指南，帮助你根据项目特点做出最佳选择。

## 核心概念

### LangChain

LangChain 是一个流行的 LLM 应用开发框架，提供了：

- **链式调用**：将多个组件串联成复杂流程
- **记忆管理**：内置多种记忆模式
- **工具集成**：丰富的预置工具
- **Agent 抽象**：开箱即用的 Agent 实现
- **向量存储集成**：与多个向量数据库的集成

### 原生开发

直接使用 AI 模型提供商的 API：

- **完全控制**：对每个请求和响应有完全控制
- **零依赖**：只依赖官方 SDK
- **性能优化**：可以针对特定场景深度优化
- **学习曲线**：需要更多底层知识

### 对比维度

| 维度 | LangChain | 原生开发 |
|------|-----------|----------|
| 启动速度 | ⚡ 快 | 🐌 慢 |
| 灵活性 | 🔸 中 | 🔥 高 |
| 抽象级别 | 🔺 高 | 🔻 低 |
| 学习曲线 | 📉 平缓 | 📈 陡峭 |
| 调试难度 | 🔸 中 | 🔹 低 |
| 依赖复杂度 | 🔺 高 | 🔻 低 |
| 性能控制 | 🔸 中 | 🔥 高 |

## 实战示例

### 场景 1：简单问答机器人

**使用 LangChain**

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

const llm = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7
});

const prompt = PromptTemplate.fromTemplate(
  '你是一个有帮助的助手。请回答：{question}'
);

const chain = prompt.pipe(llm).pipe(new StringOutputParser());

const response = await chain.invoke({ question: '什么是 LangChain？' });
console.log(response);
~~~

**使用原生开发**

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

const response = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: '你是一个有帮助的助手。'
    },
    {
      role: 'user',
      content: '什么是 LangChain？'
    }
  ],
  temperature: 0.7
});

console.log(response.choices[0].message.content);
~~~

**分析**：对于简单场景，原生代码更简洁直接。

### 场景 2：带记忆的对话

**使用 LangChain**

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ConversationBufferMemory } from 'langchain/memory';
import { ConversationChain } from 'langchain/chains';

const llm = new ChatOpenAI({ modelName: 'gpt-4' });

const memory = new ConversationBufferMemory({
  returnMessages: true,
  memoryKey: 'history'
});

const chain = new ConversationChain({
  llm,
  memory
});

// 第一次对话
await chain.call({ input: '我叫 Hamlin' });
// 第二次对话（记住之前的内容）
await chain.call({ input: '我叫什么名字？' });
~~~

**使用原生开发**

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

class ConversationMemory {
  private messages: Array<{ role: string; content: string }> = [];

  add(role: string, content: string): void {
    this.messages.push({ role, content });
  }

  getMessages(): Array<{ role: string; content: string }> {
    return [...this.messages];
  }
}

const memory = new ConversationMemory();

async function chat(userInput: string): Promise<string> {
  memory.add('user', userInput);

  const response = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: '你是一个有帮助的助手。' },
      ...memory.getMessages()
    ]
  });

  const assistantMessage = response.choices[0].message.content || '';
  memory.add('assistant', assistantMessage);

  return assistantMessage;
}

await chat('我叫 Hamlin');
await chat('我叫什么名字？');
~~~

**分析**：LangChain 的记忆管理更方便，但原生实现也不复杂。

### 场景 3：工具调用 Agent

**使用 LangChain**

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { DynamicTool } from 'langchain/tools';

const llm = new ChatOpenAI({ modelName: 'gpt-4' });

const tools = [
  new DynamicTool({
    name: 'calculator',
    description: '用于数学计算',
    func: async (input: string) => {
      return eval(input).toString();
    }
  }),
  new DynamicTool({
    name: 'search',
    description: '搜索信息',
    func: async (input: string) => {
      // 实现搜索逻辑
      return `搜索结果：${input}`;
    }
  })
];

const prompt = await createReactAgent({ llm, tools });

const agent = new AgentExecutor({
  agent: prompt,
  tools
});

const result = await agent.invoke({
  input: '计算 123 * 456'
});
~~~

**使用原生开发**

```typescript
import OpenAI from 'openai';

const client = new OpenAI();

interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<string>;
}

const tools: Tool[] = [
  {
    name: 'calculator',
    description: '用于数学计算',
    parameters: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: '数学表达式' }
      },
      required: ['expression']
    },
    execute: async (params) => {
      return eval(params.expression).toString();
    }
  },
  {
    name: 'search',
    description: '搜索信息',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词' }
      },
      required: ['query']
    },
    execute: async (params) => {
      return `搜索结果：${params.query}`;
    }
  }
];

async function runAgent(userMessage: string): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: `你是一个有用的助手。你可以使用以下工具：
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

当需要使用工具时，以 JSON 格式响应：
{"tool": "工具名", "parameters": {...}}`
    },
    { role: 'user', content: userMessage }
  ];

  let maxIterations = 10;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages
    });

    const content = response.choices[0].message.content || '';

    // 检查是否需要调用工具
    const toolMatch = content.match(/\{[\s\S]*"tool"[\s\S]*\}/);

    if (toolMatch) {
      const toolCall = JSON.parse(toolMatch[0]);
      const tool = tools.find(t => t.name === toolCall.tool);

      if (tool) {
        const result = await tool.execute(toolCall.parameters);

        messages.push({
          role: 'assistant',
          content: JSON.stringify(toolCall)
        });

        messages.push({
          role: 'user',
          content: `工具 ${tool.name} 的返回结果：${result}`
        });

        continue;
      }
    }

    // 不需要工具调用，返回最终答案
    return content;
  }

  throw new Error('超过最大迭代次数');
}

const result = await runAgent('计算 123 * 456');
console.log(result);
~~~

**分析**：原生实现需要更多代码，但提供了完全的控制权。

## 选型决策框架

### 使用 LangChain 的场景

1. **快速原型开发**：需要快速验证想法
2. **标准工作流**：使用常见的链式调用模式
3. **团队协作**：团队成员对 LangChain 熟悉
4. **丰富集成**：需要使用 LangChain 生态的工具

### 使用原生开发的场景

1. **性能关键**：需要极致的性能优化
2. **特殊需求**：框架无法满足的特殊逻辑
3. **长期维护**：担心框架版本升级带来的破坏性变更
4. **学习目的**：深入理解底层机制

### 混合方案

```typescript
// 结合两者的优点
import { ChatOpenAI } from '@langchain/openai';
import Anthropic from '@anthropic-ai/sdk';

// 使用 LangChain 处理标准流程
const langchainLLM = new ChatOpenAI({ modelName: 'gpt-4' });

// 使用原生 API 处理特殊需求
const anthropicClient = new Anthropic();

async function hybridAgent(input: string): Promise<string> {
  // 简单对话使用 LangChain
  if (input.length < 100) {
    return langchainLLM.invoke(input);
  }

  // 复杂任务使用 Claude + 工具调用
  return anthropicClient.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    tools: [...]
  });
}
~~~

## 最佳实践

### 1. 抽象层设计

无论选择哪种方案，都应该创建抽象层：

```typescript
// 定义统一的接口
interface LLMProvider {
  chat(messages: Message[]): Promise<string>;
  stream(messages: Message[]): AsyncIterable<string>;
}

// LangChain 实现
class LangChainProvider implements LLMProvider {
  async chat(messages: Message[]): Promise<string> {
    // LangChain 实现
  }
}

// 原生实现
class NativeProvider implements LLMProvider {
  async chat(messages: Message[]): Promise<string> {
    // 原生 API 实现
  }
}

// 使用工厂模式
class LLMProviderFactory {
  static create(type: 'langchain' | 'native'): LLMProvider {
    switch (type) {
      case 'langchain':
        return new LangChainProvider();
      case 'native':
        return new NativeProvider();
    }
  }
}
~~~

### 2. 配置驱动

```typescript
// config.ts
export const config = {
  provider: process.env.LLM_PROVIDER || 'native',
  model: process.env.LLM_MODEL || 'claude-3-5-sonnet-20241022',
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7')
};

// 使用配置
const provider = LLMProviderFactory.create(config.provider);
~~~

### 3. 渐进式迁移

```typescript
// 从 LangChain 开始，逐步迁移到原生
class HybridAgent {
  private useNative = false;

  async chat(input: string): Promise<string> {
    if (this.useNative) {
      return this.nativeChat(input);
    }
    return this.langchainChat(input);
  }

  enableNative(): void {
    this.useNative = true;
  }
}
~~~

## 性能对比

### 请求延迟

| 方案 | 冷启动 | 首次请求 | 后续请求 |
|------|--------|----------|----------|
| LangChain | ~2s | ~500ms | ~300ms |
| 原生 | ~500ms | ~200ms | ~150ms |

### 内存占用

| 方案 | 基础 | 10 并发 | 100 并发 |
|------|------|---------|----------|
| LangChain | ~100MB | ~300MB | ~2GB |
| 原生 | ~30MB | ~100MB | ~500MB |

## 迁移指南

### 从 LangChain 到原生

1. **识别关键依赖**：记录使用的 LangChain 功能
2. **实现等价功能**：用原生代码实现
3. **逐步替换**：一次替换一个组件
4. **充分测试**：确保行为一致

### 从原生到 LangChain

1. **评估需求**：确定 LangChain 能带来价值
2. **学习框架**：理解 LangChain 的抽象
3. **重构代码**：将原生代码迁移到 LangChain
4. **利用特性**：使用 LangChain 的额外功能

## 决策树

~~~
是否需要快速启动？
├── 是 → LangChain
└── 否 → 是否有特殊性能需求？
    ├── 是 → 原生开发
    └── 否 → 是否需要深度定制？
        ├── 是 → 原生开发
        └── 否 → LangChain
~~~

## 参考资料

- [LangChain 官方文档](https://js.langchain.com/)
- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)
- [Anthropic API 文档](https://docs.anthropic.com/en/api/getting-started)

---

**下一篇**：[RAG + Agent：知识库驱动的智能助手](./08-rag-agent.md)
