---
title: mcp-protocol
---

# MCP 协议深入：模型上下文协议实战

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在构建 AI Agent 时，一个核心挑战是：**如何让 AI 访问外部系统和数据？** 传统的工具调用方式存在诸多问题：

- 每个工具需要单独集成
- 缺乏统一的接口标准
- 难以在多个 Agent 之间共享工具
- 工具发现和文档维护困难

MCP（Model Context Protocol）解决了这些问题。作为一个开放标准，MCP 定义了 AI 应用与外部数据源、工具之间的通信协议。本文将深入探讨 MCP 协议，并展示如何实现 MCP 服务器和客户端。

## 核心概念

### 什么是 MCP？

MCP 是一个开放协议，用于连接 AI 应用与外部系统：

~~~
┌─────────────────────────────────────────────────────────┐
│                    MCP 架构                             │
│                                                          │
│  ┌──────────┐      ┌──────────┐      ┌──────────┐      │
│  │   MCP    │──────▶│   MCP    │──────▶│   MCP    │      │
│  │ Client   │      │  Host    │      │ Server  │      │
│  │(Agent)  │      │ (Claude) │      │ (Tools)  │      │
│  └──────────┘      └──────────┘      └──────────┘      │
│                            ▲                           │
│                            │                           │
│                    ┌───────┴───────┐                   │
│                    │  MCP 协议     │                   │
│                    │  • JSON-RPC   │                   │
│                    │  • STDIO/HTTP │                  │
│                    └───────────────┘                   │
└─────────────────────────────────────────────────────────┘
~~~

### 核心组件

1. **MCP Client**：发起请求的 AI 应用
2. **MCP Host**：管理和协调 MCP 连接的组件
3. **MCP Server**：提供工具和资源的实现

### MCP 消息类型

```typescript
// MCP 消息类型
type MCPMessage =
  | { jsonrpc: '2.0'; id: number | string; method: string; params?: any }
  | { jsonrpc: '2.0'; id: number | string; result: any }
  | { jsonrpc: '2.0'; id: number | string; error: MCPError }
  | { jsonrpc: '2.0'; method: string; params?: any }; // 通知

interface MCPError {
  code: number;
  message: string;
  data?: any;
}
~~~

## 实战示例

### MCP Server 实现

```typescript
// mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

class FileServerMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'file-server',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // 列出可用工具
    this.server.setRequestHandler(
      ListToolsRequestSchema,
      async () => ({
        tools: [
          {
            name: 'read_file',
            description: '读取文件内容',
            inputSchema: {
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
            name: 'write_file',
            description: '写入文件内容',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '文件路径'
                },
                content: {
                  type: 'string',
                  description: '文件内容'
                }
              },
              required: ['path', 'content']
            }
          },
          {
            name: 'list_directory',
            description: '列出目录内容',
            inputSchema: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  description: '目录路径'
                }
              },
              required: ['path']
            }
          },
          {
            name: 'search_files',
            description: '搜索文件',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  description: '搜索模式（支持通配符）'
                },
                path: {
                  type: 'string',
                  description: '搜索路径'
                }
              },
              required: ['pattern', 'path']
            }
          }
        ]
      })
    );

    // 处理工具调用
    this.server.setRequestHandler(
      CallToolRequestSchema,
      async (request) => {
        const { name, arguments: args } = request.params;

        try {
          switch (name) {
            case 'read_file':
              return await this.readFile(args.path);

            case 'write_file':
              return await this.writeFile(args.path, args.content);

            case 'list_directory':
              return await this.listDirectory(args.path);

            case 'search_files':
              return await this.searchFiles(args.path, args.pattern);

            default:
              throw new Error(`Unknown tool: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // 列出资源
    this.server.setRequestHandler(
      ListResourcesRequestSchema,
      async () => ({
        resources: [
          {
            uri: 'file://system/status',
            name: '系统状态',
            description: '服务器运行状态信息',
            mimeType: 'application/json'
          }
        ]
      })
    );

    // 读取资源
    this.server.setRequestHandler(
      ReadResourceRequestSchema,
      async (request) => {
        const { uri } = request.params;

        if (uri === 'file://system/status') {
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify({
                  status: 'running',
                  uptime: process.uptime(),
                  memory: process.memoryUsage(),
                  version: '1.0.0'
                }, null, 2)
              }
            ]
          };
        }

        throw new Error(`Resource not found: ${uri}`);
      }
    );
  }

  private async readFile(path: string): Promise<any> {
    const fs = await import('fs/promises');
    const content = await fs.readFile(path, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: content
        }
      ]
    };
  }

  private async writeFile(path: string, content: string): Promise<any> {
    const fs = await import('fs/promises');
    await fs.writeFile(path, content, 'utf-8');

    return {
      content: [
        {
          type: 'text',
          text: `文件已写入: ${path}`
        }
      ]
    };
  }

  private async listDirectory(path: string): Promise<any> {
    const fs = await import('fs/promises');
    const entries = await fs.readdir(path, { withFileTypes: true });

    const result = entries.map(entry => ({
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file'
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async searchFiles(path: string, pattern: string): Promise<any> {
    const { glob } = await import('glob');
    const files = await glob(pattern, { cwd: path });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(files, null, 2)
        }
      ]
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    console.error('File MCP Server running on stdio');
  }
}

// 启动服务器
const server = new FileServerMCPServer();
server.start().catch(console.error);
~~~

### MCP Client 实现

```typescript
// mcp-client.ts
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

class MCPClient {
  private client: Client;
  private transport: StdioClientTransport;

  constructor(serverCommand: string, serverArgs: string[]) {
    this.client = new Client(
      {
        name: 'mcp-client',
        version: '1.0.0'
      },
      {
        capabilities: {}
      }
    );

    this.transport = new StdioClientTransport({
      command: serverCommand,
      args: serverArgs
    });
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('Connected to MCP server');
  }

  async listTools(): Promise<any[]> {
    const response = await this.client.request(
      { method: 'tools/list', params: {} },
      ListToolsRequestSchema
    );

    return response.tools;
  }

  async callTool(name: string, args: Record<string, any>): Promise<string> {
    const response = await this.client.request(
      {
        method: 'tools/call',
        params: {
          name,
          arguments: args
        }
      },
      CallToolRequestSchema
    );

    if (response.content && response.content.length > 0) {
      const textContent = response.content.find((c: any) => c.type === 'text');
      return textContent?.text || '';
    }

    return '';
  }

  async listResources(): Promise<any[]> {
    const response = await this.client.request(
      { method: 'resources/list', params: {} },
      ListResourcesRequestSchema
    );

    return response.resources;
  }

  async readResource(uri: string): Promise<string> {
    const response = await this.client.request(
      {
        method: 'resources/read',
        params: { uri }
      },
      ReadResourceRequestSchema
    );

    if (response.contents && response.contents.length > 0) {
      const textContent = response.contents[0] as any;
      return textContent.text || '';
    }

    return '';
  }

  async close(): Promise<void> {
    await this.client.close();
  }
}

// 使用示例
async function main() {
  const client = new MCPClient('node', ['mcp-server.js']);

  try {
    await client.connect();

    // 列出可用工具
    const tools = await client.listTools();
    console.log('Available tools:', tools);

    // 调用工具
    const result = await client.callTool('read_file', { path: './test.txt' });
    console.log('File content:', result);

    // 列出资源
    const resources = await client.listResources();
    console.log('Resources:', resources);

    // 读取资源
    const status = await client.readResource('file://system/status');
    console.log('System status:', status);

  } finally {
    await client.close();
  }
}

main().catch(console.error);
~~~

### 高级功能：Prompt 模板

```typescript
// 添加 prompt 支持
class PromptMCPServer extends FileServerMCPServer {
  constructor() {
    super();
    this.setupPrompts();
  }

  private setupPrompts(): void {
    // 列出 prompts
    this.server.setRequestHandler(
      'prompts/list',
      async () => ({
        prompts: [
          {
            name: 'analyze_code',
            description: '分析代码文件',
            arguments: [
              {
                name: 'file',
                description: '要分析的文件路径',
                required: true
              },
              {
                name: 'focus',
                description: '分析重点',
                required: false
              }
            ]
          },
          {
            name: 'refactor_code',
            description: '重构代码',
            arguments: [
              {
                name: 'file',
                description: '要重构的文件路径',
                required: true
              },
              {
                name: 'style',
                description: '重构风格',
                required: false
              }
            ]
          }
        ]
      })
    );

    // 获取 prompt
    this.server.setRequestHandler(
      'prompts/get',
      async (request) => {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'analyze_code':
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `请分析以下代码文件：${args.file}

${args.focus ? `重点关注：${args.focus}` : ''}

请提供：
1. 代码结构分析
2. 潜在问题识别
3. 改进建议`
                  }
                }
              ]
            };

          case 'refactor_code':
            return {
              messages: [
                {
                  role: 'user',
                  content: {
                    type: 'text',
                    text: `请重构以下代码文件：${args.file}

${args.style ? `重构风格：${args.style}` : '遵循最佳实践'}

要求：
1. 提高代码可读性
2. 优化性能
3. 添加必要注释
4. 保持功能不变`
                  }
                }
              ]
            };

          default:
            throw new Error(`Unknown prompt: ${name}`);
        }
      }
    );
  }
}
~~~

### 与 Claude Code 集成

```typescript
// claude-mcp-integration.ts
import Anthropic from '@anthropic-ai/sdk';

class ClaudeMCPIntegration {
  private anthropic: Anthropic;
  private mcpClient: MCPClient;

  constructor(apiKey: string, mcpClient: MCPClient) {
    this.anthropic = new Anthropic({ apiKey });
    this.mcpClient = mcpClient;
  }

  async chatWithTools(userMessage: string): Promise<string> {
    // 获取 MCP 工具列表
    const mcpTools = await this.mcpClient.listTools();

    // 转换为 Claude 格式
    const claudeTools = mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.inputSchema
    }));

    // 初始消息
    const messages = [{ role: 'user', content: userMessage }];

    let maxIterations = 10;

    for (let i = 0; i < maxIterations; i++) {
      // 调用 Claude
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        tools: claudeTools,
        messages
      });

      // 检查是否需要工具调用
      const toolUseBlocks = response.content.filter(
        (block: any) => block.type === 'tool_use'
      );

      if (toolUseBlocks.length === 0) {
        // 返回最终响应
        const textBlock = response.content.find(
          (block: any) => block.type === 'text'
        );
        return textBlock?.text || 'No response';
      }

      // 添加助手响应到消息历史
      messages.push({
        role: 'assistant',
        content: response.content
      });

      // 执行工具调用
      for (const block of toolUseBlocks) {
        const result = await this.mcpClient.callTool(
          block.name,
          block.input
        );

        // 添加工具结果
        messages.push({
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: block.id,
              content: result
            }
          ]
        });
      }
    }

    throw new Error('Max iterations exceeded');
  }
}
~~~

## 最佳实践

### 1. 错误处理

```typescript
class RobustMCPServer {
  private async handleToolCall(
    name: string,
    args: Record<string, any>
  ): Promise<any> {
    try {
      // 验证输入
      this.validateInput(name, args);

      // 执行操作
      const result = await this.executeTool(name, args);

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error in ${name}: ${error instanceof Error ? error.message : String(error)}`
          }
        ],
        isError: true
      };
    }
  }

  private validateInput(name: string, args: Record<string, any>): void {
    // 输入验证逻辑
  }

  private async executeTool(name: string, args: Record<string, any>): Promise<any> {
    // 工具执行逻辑
  }
}
~~~

### 2. 资源管理

```typescript
class ResourceMCPServer {
  private resources = new Map<string, any>();

  registerResource(uri: string, handler: () => Promise<any>): void {
    this.resources.set(uri, handler);
  }

  async readResource(uri: string): Promise<any> {
    const handler = this.resources.get(uri);
    if (!handler) {
      throw new Error(`Resource not found: ${uri}`);
    }

    return await handler();
  }
}
~~~

### 3. 权限控制

```typescript
class SecureMCPServer {
  private permissions: Map<string, string[]> = new Map();

  grantPermission(clientId: string, tool: string): void {
    if (!this.permissions.has(clientId)) {
      this.permissions.set(clientId, []);
    }
    this.permissions.get(clientId)!.push(tool);
  }

  checkPermission(clientId: string, tool: string): boolean {
    const allowed = this.permissions.get(clientId);
    return allowed ? allowed.includes(tool) : false;
  }

  async handleToolCall(
    clientId: string,
    name: string,
    args: Record<string, any>
  ): Promise<any> {
    if (!this.checkPermission(clientId, name)) {
      throw new Error(`Permission denied for tool: ${name}`);
    }

    return await this.executeTool(name, args);
  }
}
~~~

## 参考资料

- [MCP 官方规范](https://spec.modelcontextprotocol.io/)
- [MCP SDK 文档](https://github.com/modelcontextprotocol/typescript-sdk)
- [Claude MCP 集成](https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector)

---

**下一篇**：[Tmux + AI 开发：极致高效的终端工作流](./10-tmux-ai-workflow.md)
