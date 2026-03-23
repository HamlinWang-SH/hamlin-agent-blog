---
title: agent-swarm
---

# Agent Swarm 架构模式：多协作系统设计

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在开发复杂的 AI 应用时，我经常遇到一个难题：单个 Agent 难以同时精通多个领域。让一个 Agent 既懂代码审查、又懂系统运维、还要理解业务逻辑，结果往往是"样样通，样样松"。

Agent Swarm（Agent 群体）架构解决了这个问题。通过将任务分解给多个专业化 Agent 协作完成，我们既能保证每个 Agent 在其领域的专业性，又能通过协作实现复杂目标。本文分享我在设计和实现 Agent Swarm 系统时的经验。

## 核心概念

### 什么是 Agent Swarm？

Agent Swarm 是一种多 Agent 协作架构，其中多个专业化 Agent 共同工作以完成复杂任务。每个 Agent 专注于特定领域，通过通信和协作实现集体智能。

### 核心组件

~~~
┌─────────────────────────────────────────────────────────┐
│                    Orchestrator                         │
│              (任务分解与结果整合)                        │
└────────────┬────────────────────────────────────────────┘
             │
    ┌────────┼────────┬────────┬────────┐
    ▼        ▼        ▼        ▼        ▼
┌────────┐┌───────┐┌──────┐┌──────┐┌──────┐
│Research││Code   ││Test  ││Review││Deploy│
│ Agent  ││Agent  ││Agent ││Agent ││Agent │
└────────┘└───────┘└──────┘└──────┘└──────┘
     │        │       │       │       │
     └────────┴───────┴───────┴───────┘
                    │
            ┌───────▼────────┐
            │ Shared Memory  │
            │   (Knowledge)  │
            └────────────────┘
~~~

### 协作模式

1. **层次式 (Hierarchical)**：Manager Agent 分配任务给 Worker Agents
2. **扁平式 (Flat)**：所有 Agent 平等协作，通过通信协议协调
3. **混合式 (Hybrid)**：结合层次和扁平模式

## 实战示例

### 完整的 Swarm 实现

让我们构建一个软件开发 Agent Swarm：

```typescript
// types.ts
interface Message {
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast';
  content: any;
  timestamp: number;
}

interface AgentConfig {
  name: string;
  role: string;
  capabilities: string[];
  model?: string;
}

interface Task {
  id: string;
  type: string;
  description: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies?: string[];
  result?: any;
}

// agent.ts
import Anthropic from '@anthropic-ai/sdk';

abstract class BaseAgent {
  protected client: Anthropic;
  protected config: AgentConfig;
  protected messageQueue: Message[] = [];

  constructor(config: AgentConfig, apiKey: string) {
    this.config = config;
    this.client = new Anthropic({ apiKey });
  }

  abstract processTask(task: Task): Promise<any>;

  async sendMessage(message: Message): Promise<void> {
    // 实现消息发送逻辑
  }

  protected async chat(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.text || '';
  }
}

// 具体Agent实现
class ResearchAgent extends BaseAgent {
  async processTask(task: Task): Promise<any> {
    const systemPrompt = `你是一个研究 Agent，负责收集和分析信息。

任务：收集最佳实践、设计模式、技术文档

输出格式：
{
  "findings": ["发现1", "发现2"],
  "sources": ["来源1", "来源2"],
  "recommendations": ["建议1", "建议2"]
}`;

    const result = await this.chat(systemPrompt, task.description);
    return JSON.parse(result);
  }
}

class CodeAgent extends BaseAgent {
  async processTask(task: Task): Promise<any> {
    const systemPrompt = `你是一个代码生成 Agent，负责实现功能。

规则：
1. 遵循项目编码规范
2. 添加适当的错误处理
3. 编写清晰的注释
4. 考虑边界情况

输出代码块，包含语言标识符。`;

    return await this.chat(systemPrompt, task.description);
  }
}

class TestAgent extends BaseAgent {
  async processTask(task: Task): Promise<any> {
    const systemPrompt = `你是一个测试 Agent，负责生成测试用例。

覆盖范围：
1. 正常场景
2. 边界条件
3. 错误处理
4. 性能测试

使用 Jest/Mocha 格式。`;

    return await this.chat(systemPrompt, task.description);
  }
}

class ReviewAgent extends BaseAgent {
  async processTask(task: Task): Promise<any> {
    const systemPrompt = `你是一个代码审查 Agent。

审查维度：
1. 安全性
2. 性能
3. 可维护性
4. 最佳实践

输出审查报告。`;

    return await this.chat(systemPrompt, task.description);
  }
}

// orchestrator.ts
class SwarmOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private taskQueue: Task[] = [];
  private completedTasks: Map<string, Task> = new Map();
  private sharedMemory: Map<string, any> = new Map();

  registerAgent(agent: BaseAgent): void {
    this.agents.set(agent.config.name, agent);
  }

  async executeGoal(goal: string): Promise<any> {
    console.log(`🎯 目标: ${goal}`);

    // 第一步：任务分解
    const tasks = await this.decomposeGoal(goal);
    console.log(`📋 分解为 ${tasks.length} 个任务`);

    // 第二步：任务分配
    for (const task of tasks) {
      await this.assignTask(task);
    }

    // 第三步：执行任务（处理依赖关系）
    const results = await this.executeTasks();

    // 第四步：整合结果
    return this.integrateResults(results);
  }

  private async decomposeGoal(goal: string): Promise<Task[]> {
    const orchestratorAgent = new BaseAgent({
      name: 'orchestrator',
      role: 'coordinator',
      capabilities: ['planning', 'decomposition']
    }, process.env.ANTHROPIC_API_KEY!);

    const systemPrompt = `你是一个任务分解专家。

将用户目标分解为具体的、可执行的任务。

输出 JSON 格式：
{
  "tasks": [
    {
      "id": "task-1",
      "type": "research|code|test|review",
      "description": "详细描述",
      "dependencies": []
    }
  ]
}`;

    const response = await orchestratorAgent.chat(systemPrompt, goal);
    const parsed = JSON.parse(response);

    return parsed.tasks.map((t: any) => ({
      ...t,
      status: 'pending'
    }));
  }

  private async assignTask(task: Task): Promise<void> {
    // 根据任务类型找到合适的 Agent
    const agentType = task.type;
    const agent = Array.from(this.agents.values()).find(
      a => a.config.role === agentType
    );

    if (!agent) {
      throw new Error(`没有找到 ${agentType} 类型的 Agent`);
    }

    task.assignedTo = agent.config.name;
    this.taskQueue.push(task);
  }

  private async executeTasks(): Promise<Map<string, any>> {
    const results = new Map<string, any>();
    const executed = new Set<string>();

    while (executed.size < this.taskQueue.length) {
      // 找出所有依赖已满足的任务
      const readyTasks = this.taskQueue.filter(task => {
        if (executed.has(task.id)) return false;
        if (!task.dependencies) return true;

        return task.dependencies.every(dep => executed.has(dep));
      });

      if (readyTasks.length === 0) {
        throw new Error('循环依赖或无法满足的依赖');
      }

      // 并行执行就绪的任务
      await Promise.all(readyTasks.map(async task => {
        const agent = this.agents.get(task.assignedTo!);
        if (!agent) return;

        console.log(`⚙️ ${task.assignedTo} 执行任务: ${task.id}`);
        task.status = 'in_progress';

        try {
          const result = await agent.processTask(task);
          task.result = result;
          task.status = 'completed';
          results.set(task.id, result);
          executed.add(task.id);

          // 更新共享内存
          this.sharedMemory.set(task.id, result);
        } catch (error) {
          task.status = 'failed';
          console.error(`❌ 任务 ${task.id} 失败:`, error);
          throw error;
        }
      }));
    }

    return results;
  }

  private integrateResults(results: Map<string, any>): any {
    console.log('🔄 整合结果...');

    // 根据任务类型整合结果
    const integration = {
      research: [],
      code: [],
      tests: [],
      reviews: []
    };

    for (const [taskId, result] of results) {
      const task = this.taskQueue.find(t => t.id === taskId);
      if (!task) continue;

      switch (task.type) {
        case 'research':
          integration.research.push(result);
          break;
        case 'code':
          integration.code.push(result);
          break;
        case 'test':
          integration.tests.push(result);
          break;
        case 'review':
          integration.reviews.push(result);
          break;
      }
    }

    return integration;
  }
}

// 使用示例
async function main() {
  const orchestrator = new SwarmOrchestrator();

  // 注册 Agents
  orchestrator.registerAgent(new ResearchAgent({
    name: 'researcher-1',
    role: 'research',
    capabilities: ['search', 'analyze', 'document']
  }, process.env.ANTHROPIC_API_KEY!));

  orchestrator.registerAgent(new CodeAgent({
    name: 'coder-1',
    role: 'code',
    capabilities: ['generate', 'refactor', 'debug']
  }, process.env.ANTHROPIC_API_KEY!));

  orchestrator.registerAgent(new TestAgent({
    name: 'tester-1',
    role: 'test',
    capabilities: ['unit-test', 'integration-test']
  }, process.env.ANTHROPIC_API_KEY!));

  orchestrator.registerAgent(new ReviewAgent({
    name: 'reviewer-1',
    role: 'review',
    capabilities: ['security-review', 'performance-review']
  }, process.env.ANTHROPIC_API_KEY!));

  // 执行目标
  const result = await orchestrator.executeGoal(
    '开发一个用户认证系统，包含注册、登录、密码重置功能，需要完整的测试覆盖和安全审查'
  );

  console.log('✅ 完成:', JSON.stringify(result, null, 2));
}
~~~

### 通信协议实现

```typescript
// message-bus.ts
class MessageBus {
  private handlers: Map<string, Set<(msg: Message) => void>> = new Map();
  private history: Message[] = [];

  subscribe(agentName: string, handler: (msg: Message) => void): void {
    if (!this.handlers.has(agentName)) {
      this.handlers.set(agentName, new Set());
    }
    this.handlers.get(agentName)!.add(handler);
  }

  publish(message: Message): void {
    this.history.push(message);

    const handlers = this.handlers.get(message.to);
    if (handlers) {
      handlers.forEach(h => h(message));
    }

    // 处理广播消息
    if (message.type === 'broadcast') {
      this.handlers.forEach((handlers, agentName) => {
        if (agentName !== message.from) {
          handlers.forEach(h => h(message));
        }
      });
    }
  }

  getHistory(agentName: string): Message[] {
    return this.history.filter(m =>
      m.to === agentName || m.from === agentName || m.type === 'broadcast'
    );
  }
}

// 扩展 BaseAgent 使用 MessageBus
abstract class CommunicativeAgent extends BaseAgent {
  private messageBus: MessageBus;

  constructor(config: AgentConfig, apiKey: string, messageBus: MessageBus) {
    super(config, apiKey);
    this.messageBus = messageBus;

    // 订阅消息
    this.messageBus.subscribe(config.name, (msg) => this.handleMessage(msg));
  }

  private handleMessage(message: Message): void {
    this.messageQueue.push(message);
    this.processMessageQueue();
  }

  private async processMessageQueue(): Promise<void> {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) continue;

      // 处理消息
      await this.onMessage(message);
    }
  }

  protected abstract onMessage(message: Message): Promise<void>;

  protected sendTo(to: string, content: any): void {
    const message: Message = {
      from: this.config.name,
      to,
      type: 'request',
      content,
      timestamp: Date.now()
    };
    this.messageBus.publish(message);
  }

  protected broadcast(content: any): void {
    const message: Message = {
      from: this.config.name,
      to: 'all',
      type: 'broadcast',
      content,
      timestamp: Date.now()
    };
    this.messageBus.publish(message);
  }
}
~~~

## 最佳实践

### 1. 任务分解原则

**SMART 原则**：
- **S**pecific：任务描述清晰明确
- **M**easurable：结果可验证
- **A**chievable：在单个 Agent 能力范围内
- **R**elevant：与整体目标相关
- **T**ime-bound：有明确的完成标准

### 2. 依赖管理

```typescript
// 使用 DAG (有向无环图) 检测循环依赖
class TaskDependencyChecker {
  private buildGraph(tasks: Task[]): Map<string, string[]> {
    const graph = new Map<string, string[]>();
    for (const task of tasks) {
      graph.set(task.id, task.dependencies || []);
    }
    return graph;
  }

  hasCycle(tasks: Task[]): boolean {
    const graph = this.buildGraph(tasks);
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;

      visited.add(node);
      recursionStack.add(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) return true;
      }

      recursionStack.delete(node);
      return false;
    };

    for (const task of tasks) {
      if (dfs(task.id)) return true;
    }

    return false;
  }
}
~~~

### 3. 错误恢复

```typescript
class ErrorRecoveryHandler {
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 5000];

  async executeWithRetry<T>(
    task: Task,
    fn: () => Promise<T>
  ): Promise<T> {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === this.maxRetries - 1) {
          // 最后一次尝试失败，标记任务为失败
          task.status = 'failed';
          throw error;
        }

        // 等待后重试
        await new Promise(r =>
          setTimeout(r, this.retryDelays[attempt])
        );

        // 可以通知其他 Agent
        console.log(`重试任务 ${task.id} (尝试 ${attempt + 2}/${this.maxRetries})`);
      }
    }

    throw new Error('不应该到达这里');
  }
}
~~~

### 4. 资源管理

```typescript
class ResourceManager {
  private agentCapacity = new Map<string, number>();
  private agentLoad = new Map<string, number>();

  setCapacity(agentName: string, capacity: number): void {
    this.agentCapacity.set(agentName, capacity);
    this.agentLoad.set(agentName, 0);
  }

  canAccept(agentName: string): boolean {
    const capacity = this.agentCapacity.get(agentName) || 1;
    const load = this.agentLoad.get(agentName) || 0;
    return load < capacity;
  }

  allocate(agentName: string): void {
    const load = this.agentLoad.get(agentName) || 0;
    this.agentLoad.set(agentName, load + 1);
  }

  release(agentName: string): void {
    const load = this.agentLoad.get(agentName) || 0;
    this.agentLoad.set(agentName, Math.max(0, load - 1));
  }
}
~~~

### 5. 监控和调试

```typescript
class SwarmMonitor {
  private metrics = {
    tasksCompleted: 0,
    tasksFailed: 0,
    averageExecutionTime: 0,
    agentUtilization: new Map<string, number>()
  };

  recordTaskCompletion(taskId: string, duration: number, success: boolean): void {
    if (success) {
      this.metrics.tasksCompleted++;
    } else {
      this.metrics.tasksFailed++;
    }

    // 更新平均执行时间
    const total = this.metrics.tasksCompleted + this.metrics.tasksFailed;
    this.metrics.averageExecutionTime =
      (this.metrics.averageExecutionTime * (total - 1) + duration) / total;
  }

  getReport(): object {
    return {
      ...this.metrics,
      successRate: this.metrics.tasksCompleted /
        (this.metrics.tasksCompleted + this.metrics.tasksFailed)
    };
  }
}
~~~

## 高级主题

### 动态 Agent 创建

```typescript
class DynamicAgentFactory {
  async createAgentForTask(task: Task): Promise<BaseAgent> {
    // 根据任务特性动态创建 Agent
    const systemPrompt = await this.generateSystemPrompt(task);

    return new DynamicAgent({
      name: `dynamic-${task.id}`,
      role: task.type,
      capabilities: []
    }, process.env.ANTHROPIC_API_KEY!, systemPrompt);
  }

  private async generateSystemPrompt(task: Task): Promise<string> {
    // 使用 LLM 生成合适的系统提示词
    // ...
  }
}
~~~

### Agent 选举机制

```typescript
class AgentElection {
  async electLeader(agents: BaseAgent[]): Promise<BaseAgent> {
    // 基于能力、负载等因素选举 Leader
    const scores = await Promise.all(
      agents.map(async agent => ({
        agent,
        score: await this.evaluateLeader(agent)
      }))
    );

    return scores.sort((a, b) => b.score - a.score)[0].agent;
  }

  private async evaluateLeader(agent: BaseAgent): Promise<number> {
    // 评估指标：可用性、能力、历史表现等
    return 0;
  }
}
~~~

## 参考资料

- [Anthropic Agent SDK](https://docs.anthropic.com/en/docs/agent-sdk/overview)
- [Multi-Agent Systems Research](https://www.cs.cmu.edu/~multiagent/)
- [Swarm Intelligence](https://en.wikipedia.org/wiki/Sarm_intelligence)

---

**下一篇**：[Subagent 设计哲学：何时拆分、如何通信](./04-subagent-design.md)
