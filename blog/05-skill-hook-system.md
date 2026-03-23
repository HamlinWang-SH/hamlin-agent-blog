---
title: skill-hook-system
---

# Skill & Hook 系统：可扩展 Agent 架构

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在构建 Agent 应用时，我经常面临一个矛盾：Agent 需要足够智能以处理复杂任务，但每次需求变更都要修改核心代码，维护成本居高不下。

Skill（技能）和 Hook（钩子）系统解决了这个问题。通过将功能模块化为可插拔的技能，并在关键节点插入钩子，我们构建了一个既强大又灵活的 Agent 架构。本文分享我设计和实现 Skill & Hook 系统的经验。

## 核心概念

### Skill 系统

Skill 是 Agent 可以执行的、可命名的、可复用的能力单元。

~~~
┌─────────────────────────────────────────────────┐
│                   Agent Core                    │
│  ┌───────────────────────────────────────────┐  │
│  │            Skill Registry                 │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐       │  │
│  │  │ /code  │ │ /test  │ │ /deploy│       │  │
│  │  └────────┘ └────────┘ └────────┘       │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │            Hook System                    │  │
│  │  beforeStart → onMessage → afterComplete │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
~~~

### Hook 系统

Hook 是在 Agent 生命周期的关键点执行的回调函数。

### 设计原则

1. **组合优于继承**：通过组合技能来构建复杂行为
2. **声明式配置**：技能和钩子通过配置声明，而非硬编码
3. **松耦合**：技能之间相互独立，通过接口通信
4. **可测试**：每个技能可以独立测试

## 实战示例

### Skill 系统实现

```typescript
// types.ts
interface SkillDefinition {
  name: string;
  description: string;
  parameters?: SkillParameter[];
  handler: SkillHandler;
  examples?: string[];
  category?: string;
}

interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required?: boolean;
  default?: any;
  enum?: any[];
}

interface SkillContext {
  agent: Agent;
  args: Record<string, any>;
  metadata: {
    timestamp: number;
    userId?: string;
    sessionId: string;
  };
}

type SkillHandler = (context: SkillContext) => Promise<SkillResult>;

interface SkillResult {
  success: boolean;
  output?: any;
  error?: string;
  nextActions?: string[];
}

// skill-registry.ts
class SkillRegistry {
  private skills: Map<string, SkillDefinition> = new Map();
  private categories: Map<string, Set<string>> = new Map();

  register(skill: SkillDefinition): void {
    this.skills.set(skill.name, skill);

    if (skill.category) {
      if (!this.categories.has(skill.category)) {
        this.categories.set(skill.category, new Set());
      }
      this.categories.get(skill.category)!.add(skill.name);
    }
  }

  get(name: string): SkillDefinition | undefined {
    return this.skills.get(name);
  }

  list(category?: string): string[] {
    if (category) {
      return Array.from(this.categories.get(category) || []);
    }
    return Array.from(this.skills.keys());
  }

  async execute(name: string, context: SkillContext): Promise<SkillResult> {
    const skill = this.get(name);
    if (!skill) {
      return {
        success: false,
        error: `Skill not found: ${name}`
      };
    }

    // 验证参数
    const validation = this.validateParameters(skill, context.args);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid parameters: ${validation.errors.join(', ')}`
      };
    }

    // 执行技能
    try {
      return await skill.handler(context);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private validateParameters(
    skill: SkillDefinition,
    args: Record<string, any>
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!skill.parameters) return { valid: true, errors };

    for (const param of skill.parameters) {
      // 检查必需参数
      if (param.required && !(param.name in args)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      // 检查类型
      const value = args[param.name];
      if (value !== undefined && !this.checkType(value, param.type)) {
        errors.push(`Invalid type for ${param.name}: expected ${param.type}`);
      }

      // 检查枚举值
      if (param.enum && value !== undefined && !param.enum.includes(value)) {
        errors.push(`Invalid value for ${param.name}: must be one of ${param.enum.join(', ')}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  private checkType(value: any, type: string): boolean {
    switch (type) {
      case 'string': return typeof value === 'string';
      case 'number': return typeof value === 'number';
      case 'boolean': return typeof value === 'boolean';
      case 'array': return Array.isArray(value);
      case 'object': return typeof value === 'object' && value !== null;
      default: return true;
    }
  }
}

// 内置技能实现
const builtInSkills: SkillDefinition[] = [
  {
    name: 'code-review',
    description: '审查代码并提供改进建议',
    category: 'development',
    parameters: [
      {
        name: 'file',
        type: 'string',
        description: '要审查的文件路径',
        required: true
      },
      {
        name: 'focus',
        type: 'array',
        description: '审查重点',
        enum: ['security', 'performance', 'style', 'best-practices'],
        default: ['security', 'best-practices']
      }
    ],
    examples: [
      '/code-review src/auth.ts',
      '/code-review src/user.ts --focus security performance'
    ],
    handler: async (context) => {
      const { file, focus } = context.args;

      // 读取文件
      const fs = await import('fs/promises');
      const code = await fs.readFile(file, 'utf-8');

      // 调用 Claude 进行审查
      const anthropic = await import('@anthropic-ai/sdk');
      const client = new anthropic.Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });

      const prompt = `审查以下代码，重点关注：${focus.join(', ')}

\`\`\`
${code}
\`\`\`

请提供：
1. 发现的问题（按严重程度分类）
2. 改进建议
3. 修复示例（如适用）`;

      const response = await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });

      const textBlock = response.content.find(b => b.type === 'text');

      return {
        success: true,
        output: textBlock?.text || 'No response',
        nextActions: ['fix-issues', 'generate-tests']
      };
    }
  },

  {
    name: 'generate-test',
    description: '为指定代码生成测试用例',
    category: 'development',
    parameters: [
      {
        name: 'file',
        type: 'string',
        description: '要测试的文件路径',
        required: true
      },
      {
        name: 'framework',
        type: 'string',
        description: '测试框架',
        enum: ['jest', 'vitest', 'mocha'],
        default: 'vitest'
      },
      {
        name: 'coverage',
        type: 'string',
        description: '目标覆盖率',
        enum: ['basic', 'comprehensive', 'edge-cases'],
        default: 'comprehensive'
      }
    ],
    handler: async (context) => {
      // 实现测试生成逻辑
      return {
        success: true,
        output: '生成的测试代码...'
      };
    }
  },

  {
    name: 'deploy',
    description: '部署应用',
    category: 'deployment',
    parameters: [
      {
        name: 'environment',
        type: 'string',
        description: '部署环境',
        enum: ['staging', 'production'],
        required: true
      },
      {
        name: 'skip-tests',
        type: 'boolean',
        description: '是否跳过测试',
        default: false
      }
    ],
    handler: async (context) => {
      // 实现部署逻辑
      return {
        success: true,
        output: '部署完成'
      };
    }
  }
];
~~~

### Hook 系统实现

```typescript
// hook-types.ts
type HookName =
  | 'beforeStart'
  | 'afterStart'
  | 'beforeMessage'
  | 'afterMessage'
  | 'beforeSkill'
  | 'afterSkill'
  | 'onError'
  | 'beforeComplete'
  | 'afterComplete';

interface HookDefinition {
  name: string;
  hook: HookName;
  handler: HookHandler;
  priority?: number; // 数字越大优先级越高
  once?: boolean; // 是否只执行一次
}

type HookHandler = (context: HookContext) => Promise<void> | void;

interface HookContext {
  agent: Agent;
  event: HookName;
  data: any;
  metadata: {
    timestamp: number;
    duration?: number;
  };
}

// hook-registry.ts
class HookRegistry {
  private hooks: Map<HookName, HookDefinition[]> = new Map();
  private executedOnce: Set<string> = new Set();

  register(hook: HookDefinition): void {
    if (!this.hooks.has(hook.hook)) {
      this.hooks.set(hook.hook, []);
    }

    const hooks = this.hooks.get(hook.hook)!;
    hooks.push(hook);

    // 按优先级排序
    hooks.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  async execute(hookName: HookName, context: HookContext): Promise<void> {
    const hooks = this.hooks.get(hookName) || [];

    for (const hook of hooks) {
      // 检查是否应该执行
      if (hook.once && this.executedOnce.has(hook.name)) {
        continue;
      }

      try {
        await hook.handler(context);

        if (hook.once) {
          this.executedOnce.add(hook.name);
        }
      } catch (error) {
        console.error(`Hook ${hook.name} failed:`, error);

        // 触发错误钩子
        if (hookName !== 'onError') {
          await this.execute('onError', {
            ...context,
            data: { originalHook: hook, error }
          });
        }
      }
    }
  }

  remove(hookName: string): void {
    for (const hooks of this.hooks.values()) {
      const index = hooks.findIndex(h => h.name === hookName);
      if (index >= 0) {
        hooks.splice(index, 1);
      }
    }
  }
}

// 常用钩子实现
const commonHooks: HookDefinition[] = [
  {
    name: 'log-start',
    hook: 'beforeStart',
    priority: 100,
    handler: async (context) => {
      console.log(`[${context.agent.name}] Starting at ${new Date().toISOString()}`);
    }
  },
  {
    name: 'log-message',
    hook: 'beforeMessage',
    priority: 50,
    handler: async (context) => {
      console.log(`[${context.agent.name}] Processing message:`, context.data.message?.substring(0, 50) + '...');
    }
  },
  {
    name: 'track-tokens',
    hook: 'afterMessage',
    priority: 10,
    handler: async (context) => {
      const tokens = context.data.usage?.total_tokens || 0;
      console.log(`[${context.agent.name}] Tokens used: ${tokens}`);
    }
  },
  {
    name: 'notify-error',
    hook: 'onError',
    priority: 100,
    handler: async (context) => {
      const error = context.data.error;
      // 发送错误通知
      console.error(`[${context.agent.name}] Error:`, error);
    }
  }
];
~~~

### 完整的 Agent 实现

```typescript
// agent.ts
class Agent {
  public name: string;
  private skillRegistry: SkillRegistry;
  private hookRegistry: HookRegistry;
  private state: Map<string, any> = new Map();

  constructor(
    name: string,
    config?: {
      skills?: SkillDefinition[];
      hooks?: HookDefinition[];
    }
  ) {
    this.name = name;
    this.skillRegistry = new SkillRegistry();
    this.hookRegistry = new HookRegistry();

    // 注册内置技能和钩子
    builtInSkills.forEach(s => this.skillRegistry.register(s));
    commonHooks.forEach(h => this.hookRegistry.register(h));

    // 注册自定义技能和钩子
    if (config?.skills) {
      config.skills.forEach(s => this.skillRegistry.register(s));
    }
    if (config?.hooks) {
      config.hooks.forEach(h => this.hookRegistry.register(h));
    }
  }

  async start(): Promise<void> {
    await this.hookRegistry.execute('beforeStart', {
      agent: this,
      event: 'beforeStart',
      data: {},
      metadata: { timestamp: Date.now() }
    });

    // 初始化逻辑

    await this.hookRegistry.execute('afterStart', {
      agent: this,
      event: 'afterStart',
      data: {},
      metadata: { timestamp: Date.now() }
    });
  }

  async processMessage(message: string): Promise<string> {
    const startTime = Date.now();

    await this.hookRegistry.execute('beforeMessage', {
      agent: this,
      event: 'beforeMessage',
      data: { message },
      metadata: { timestamp: startTime }
    });

    let response: string;

    try {
      // 检测是否是技能调用
      if (message.startsWith('/')) {
        response = await this.executeSkill(message);
      } else {
        response = await this.chat(message);
      }

      await this.hookRegistry.execute('afterMessage', {
        agent: this,
        event: 'afterMessage',
        data: { message, response, usage: { total_tokens: 0 } },
        metadata: {
          timestamp: startTime,
          duration: Date.now() - startTime
        }
      });

      return response;
    } catch (error) {
      await this.hookRegistry.execute('onError', {
        agent: this,
        event: 'onError',
        data: { error },
        metadata: {
          timestamp: startTime,
          duration: Date.now() - startTime
        }
      });
      throw error;
    }
  }

  private async executeSkill(command: string): Promise<string> {
    const [name, ...argsParts] = command.split(' ');
    const skillName = name.substring(1); // 去掉 /
    const args = this.parseArgs(argsParts);

    await this.hookRegistry.execute('beforeSkill', {
      agent: this,
      event: 'beforeSkill',
      data: { skill: skillName, args },
      metadata: { timestamp: Date.now() }
    });

    const result = await this.skillRegistry.execute(skillName, {
      agent: this,
      args,
      metadata: {
        timestamp: Date.now(),
        sessionId: this.generateSessionId()
      }
    });

    await this.hookRegistry.execute('afterSkill', {
      agent: this,
      event: 'afterSkill',
      data: { skill: skillName, result },
      metadata: { timestamp: Date.now() }
    });

    if (result.success) {
      return result.output || 'Skill executed successfully';
    } else {
      return `Error: ${result.error}`;
    }
  }

  private parseArgs(parts: string[]): Record<string, any> {
    const args: Record<string, any> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith('--')) {
        const key = part.substring(2);
        const nextPart = parts[i + 1];

        if (nextPart && !nextPart.startsWith('--')) {
          args[key] = nextPart;
          i++;
        } else {
          args[key] = true;
        }
      }
    }

    return args;
  }

  private async chat(message: string): Promise<string> {
    // 实现普通聊天逻辑
    return `Response to: ${message}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getState(key: string): any {
    return this.state.get(key);
  }

  setState(key: string, value: any): void {
    this.state.set(key, value);
  }
}

// 使用示例
async function main() {
  const agent = new Agent('my-agent', {
    skills: [
      {
        name: 'custom-skill',
        description: '自定义技能示例',
        handler: async (context) => {
          return {
            success: true,
            output: 'Custom skill executed!'
          };
        }
      }
    ],
    hooks: [
      {
        name: 'custom-hook',
        hook: 'beforeMessage',
        priority: 200,
        handler: async (context) => {
          console.log('Custom hook triggered!');
        }
      }
    ]
  });

  await agent.start();

  // 使用技能
  console.log(await agent.processMessage('/code-review src/auth.ts'));

  // 普通聊天
  console.log(await agent.processMessage('你好'));
}
~~~

## 最佳实践

### 1. 技能设计

```typescript
// ✅ 好的技能设计
{
  name: 'format-code',
  description: '格式化代码文件',
  parameters: [
    {
      name: 'file',
      type: 'string',
      description: '文件路径',
      required: true
    },
    {
      name: 'formatter',
      type: 'string',
      enum: ['prettier', 'biome'],
      default: 'prettier'
    }
  ],
  examples: [
    '/format-code src/index.ts',
    '/format-code src/index.ts --formatter biome'
  ],
  handler: async (ctx) => { /* ... */ }
}

// ❌ 不好的技能设计
{
  name: 'do-everything',  // 名称不具体
  description: '做很多事',  // 描述模糊
  handler: async (ctx) => { /* ... */ }  // 无参数说明
}
~~~

### 2. 钩子优先级

```typescript
// 高优先级钩子先执行（如认证）
{
  name: 'authenticate',
  hook: 'beforeMessage',
  priority: 1000,
  handler: async (ctx) => {
    // 认证逻辑
  }
}

// 低优先级钩子后执行（如日志）
{
  name: 'log-request',
  hook: 'beforeMessage',
  priority: 1,
  handler: async (ctx) => {
    // 日志记录
  }
}
~~~

### 3. 错误处理

```typescript
{
  name: 'error-handler',
  hook: 'onError',
  handler: async (ctx) => {
    const error = ctx.data.error;

    // 根据错误类型采取不同措施
    if (error instanceof ValidationError) {
      ctx.data.retry = true;
    } else if (error instanceof AuthenticationError) {
      ctx.data.stop = true;
    }

    // 记录错误
    logger.error('Agent error', { error, agent: ctx.agent.name });
  }
}
~~~

### 4. 技能组合

```typescript
// 技能可以调用其他技能
{
  name: 'full-review',
  description: '完整的代码审查流程',
  handler: async (ctx) => {
    // 调用其他技能
    await ctx.agent.processMessage('/code-review --focus security');
    await ctx.agent.processMessage('/code-review --focus performance');
    await ctx.agent.processMessage('/generate-test');

    return {
      success: true,
      output: '完整审查完成'
    };
  }
}
~~~

## 参考资料

- [Claude Code Skills 文档](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)
- [WordPress Hooks 系统](https://developer.wordpress.org/plugins/hooks/)
- [Express 中间件模式](https://expressjs.com/en/guide/writing-middleware.html)

---

**下一篇**：[Hapi.run 平台实战：快速部署 AI 应用](./06-hapi-run.md)
