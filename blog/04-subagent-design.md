---
title: subagent-design
---

# Subagent 设计哲学：何时拆分、如何通信

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

在构建 AI Agent 系统时，一个核心设计决策是：**单体 Agent 还是多 Agent 架构？** 我在早期项目中倾向于使用单一的大型 Agent，让它处理所有任务。但随着系统复杂度增加，我发现这种模式遇到了瓶颈：

- 上下文混乱，Agent 容易"遗忘"之前的指令
- 专业能力分散，难以在所有领域都达到专家水平
- 调试困难，无法定位问题来源
- 扩展受限，添加新功能可能破坏现有行为

引入 Subagent（子 Agent）模式后，这些问题得到了有效解决。但新的问题出现了：**何时应该拆分？如何设计 Subagent 之间的通信？** 本文将深入探讨这些设计决策。

## 核心概念

### 单体 Agent vs Subagent

~~~
┌─────────────────────────────┐
│      单体 Agent             │
│  ┌───────────────────────┐  │
│  │   所有功能集中在一起   │  │
│  │                       │  │
│  │  • 代码生成            │  │
│  │  • 测试编写            │  │
│  │  • 文档编写            │  │
│  │  • 代码审查            │  │
│  │  • 部署                │  │
│  └───────────────────────┘  │
└─────────────────────────────┘

┌─────────────────────────────────────────────┐
│           Subagent 架构                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │Code  │ │Test  │ │Doc   │ │Review│       │
│  │Agent │ │Agent │ │Agent │ │Agent │       │
│  └───┬──┘ └───┬──┘ └───┬──┘ └───┬──┘       │
│      └───────┴───────┴───────┴──────┘       │
│              │                               │
│         ┌────▼─────┐                        │
│         │Coordinator│                      │
│         │  Agent    │                        │
│         └───────────┘                        │
└─────────────────────────────────────────────┘
~~~

### Subagent 的类型

1. **功能型 Subagent**：按功能领域划分（代码、测试、文档等）
2. **阶段型 Subagent**：按工作流阶段划分（设计、实现、验证）
3. **专家型 Subagent**：按专业领域划分（安全、性能、前端、后端）
4. **工具型 Subagent**：封装特定工具或 API 的能力

## 实战示例

### 何时拆分：决策框架

使用以下问题评估是否需要拆分：

```typescript
interface SubagentDecisionCriteria {
  // 功能独立性问题
  hasDistinctResponsibilities: boolean;
  // 专业知识需求
  requiresDomainExpertise: string[];
  // 并行执行可能性
  canExecuteInParallel: boolean;
  // 错误隔离需求
  needsErrorIsolation: boolean;
  // 上下文复杂度
  contextComplexity: 'low' | 'medium' | 'high';
  // 复用需求
  needsToBeReused: boolean;
}

class SubagentDecisionEngine {
  shouldSplit(criteria: SubagentDecisionCriteria): {
    decision: boolean;
    reasoning: string;
    suggestedArchitecture?: string;
  } {
    const score = this.calculateScore(criteria);

    if (score >= 0.7) {
      return {
        decision: true,
        reasoning: '建议拆分：功能独立性强，专业化需求高',
        suggestedArchitecture: this.suggestArchitecture(criteria)
      };
    }

    return {
      decision: false,
      reasoning: '建议保持单体：功能耦合度高，拆分收益不明显'
    };
  }

  private calculateScore(criteria: SubagentDecisionCriteria): number {
    let score = 0;
    const weights = {
      hasDistinctResponsibilities: 0.25,
      requiresDomainExpertise: 0.30,
      canExecuteInParallel: 0.15,
      needsErrorIsolation: 0.10,
      contextComplexity: 0.10,
      needsToBeReused: 0.10
    };

    if (criteria.hasDistinctResponsibilities) {
      score += weights.hasDistinctResponsibilities;
    }

    if (criteria.requiresDomainExpertise.length > 2) {
      score += weights.requiresDomainExpertise;
    }

    if (criteria.canExecuteInParallel) {
      score += weights.canExecuteInParallel;
    }

    if (criteria.needsErrorIsolation) {
      score += weights.needsErrorIsolation;
    }

    if (criteria.contextComplexity === 'high') {
      score += weights.contextComplexity;
    }

    if (criteria.needsToBeReused) {
      score += weights.needsToBeReused;
    }

    return score;
  }

  private suggestArchitecture(criteria: SubagentDecisionCriteria): string {
    if (criteria.canExecuteInParallel) {
      return '并行 Subagent 架构';
    }

    if (criteria.requiresDomainExpertise.length > 3) {
      return '专家型 Subagent 架构';
    }

    return '功能型 Subagent 架构';
  }
}

// 使用示例
const decisionEngine = new SubagentDecisionEngine();

const result = decisionEngine.shouldSplit({
  hasDistinctResponsibilities: true,
  requiresDomainExpertise: ['coding', 'testing', 'security'],
  canExecuteInParallel: true,
  needsErrorIsolation: true,
  contextComplexity: 'high',
  needsToBeReused: true
});

console.log(result);
// {
//   decision: true,
//   reasoning: '建议拆分：功能独立性强，专业化需求高',
//   suggestedArchitecture: '并行 Subagent 架构'
// }
~~~

### Subagent 通信模式

#### 1. 同步通信（Request-Response）

```typescript
interface Subagent {
  name: string;
  request(target: string, message: any): Promise<any>;
  receive(from: string, message: any): any;
}

class SynchronousSubagent implements Subagent {
  constructor(
    public name: string,
    private handler: (message: any) => any
  ) {}

  async request(target: string, message: any): Promise<any> {
    // 通过消息总线发送同步请求
    return messageBus.sendSync(this.name, target, message);
  }

  receive(from: string, message: any): any {
    return this.handler(message);
  }
}

// 使用场景：需要立即返回结果的操作
const codeAgent = new SynchronousSubagent('code-agent', (message) => {
  if (message.type === 'generate') {
    return generateCode(message.specification);
  }
});
~~~

#### 2. 异步通信（Event-Driven）

```typescript
interface Event {
  type: string;
  source: string;
  data: any;
  timestamp: number;
}

class EventBus {
  private subscribers: Map<string, Set<(event: Event) => void>> = new Map();

  subscribe(eventType: string, handler: (event: Event) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);

    // 返回取消订阅函数
    return () => {
      this.subscribers.get(eventType)?.delete(handler);
    };
  }

  publish(event: Event): void {
    const handlers = this.subscribers.get(event.type);
    if (handlers) {
      handlers.forEach(handler => handler(event));
    }
  }
}

class EventDrivenSubagent {
  constructor(
    public name: string,
    eventBus: EventBus,
    private handlers: Map<string, (event: Event) => void>
  ) {
    // 订阅相关事件
    for (const [eventType, handler] of handlers) {
      eventBus.subscribe(eventType, handler);
    }
  }
}

// 使用场景：不需要立即响应的操作
const testAgent = new EventDrivenSubagent(
  'test-agent',
  eventBus,
  new Map([
    ['code.generated', async (event) => {
      // 代码生成完成后自动运行测试
      await runTests(event.data.filePath);
    }]
  ])
);
~~~

#### 3. 共享内存（Shared State）

```typescript
class SharedMemory {
  private state: Map<string, any> = new Map();
  private subscribers: Map<string, Set<(value: any) => void>> = new Map();

  set(key: string, value: any): void {
    this.state.set(key, value);

    // 通知订阅者
    const handlers = this.subscribers.get(key);
    if (handlers) {
      handlers.forEach(handler => handler(value));
    }
  }

  get(key: string): any {
    return this.state.get(key);
  }

  subscribe(key: string, handler: (value: any) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(handler);

    return () => {
      this.subscribers.get(key)?.delete(handler);
    };
  }
}

// 使用场景：需要在多个 Subagent 之间共享状态
const sharedMemory = new SharedMemory();

// 代码 Agent 设置当前文件
sharedMemory.set('current.file', 'src/auth.ts');

// 测试 Agent 读取当前文件
sharedMemory.subscribe('current.file', (filePath) => {
  console.log(`文件变更: ${filePath}, 需要重新运行测试`);
});
~~~

#### 4. 管道模式（Pipeline）

```typescript
interface PipelineStage {
  process(input: any): Promise<any>;
}

class Pipeline {
  private stages: PipelineStage[] = [];

  addStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  async execute(input: any): Promise<any> {
    let result = input;

    for (const stage of this.stages) {
      result = await stage.process(result);
    }

    return result;
  }
}

// 使用场景：顺序执行的处理流程
const codePipeline = new Pipeline()
  .addStage({
    async process(input) {
      // 阶段1：代码生成
      return generateCode(input.specification);
    }
  })
  .addStage({
    async process(input) {
      // 阶段2：代码审查
      return reviewCode(input);
    }
  })
  .addStage({
    async process(input) {
      // 阶段3：测试生成
      return generateTests(input);
    }
  });
~~~

### 完整的 Subagent 系统

```typescript
// subagent-registry.ts
class SubagentRegistry {
  private subagents: Map<string, Subagent> = new Map();
  private messageBus: MessageBus;

  constructor(messageBus: MessageBus) {
    this.messageBus = messageBus;
  }

  register(subagent: Subagent): void {
    this.subagents.set(subagent.name, subagent);

    // 注册消息处理器
    this.messageBus.subscribe(subagent.name, (message) => {
      return subagent.receive(message.from, message.content);
    });
  }

  get(name: string): Subagent | undefined {
    return this.subagents.get(name);
  }

  async call(target: string, message: any): Promise<any> {
    const subagent = this.get(target);
    if (!subagent) {
      throw new Error(`Subagent not found: ${target}`);
    }

    return subagent.request(target, message);
  }

  list(): string[] {
    return Array.from(this.subagents.keys());
  }
}

// coordinator.ts
class SubagentCoordinator {
  constructor(private registry: SubagentRegistry) {}

  async executeWorkflow(workflow: WorkflowStep[]): Promise<any[]> {
    const results: any[] = [];

    for (const step of workflow) {
      const subagent = this.registry.get(step.subagent);
      if (!subagent) {
        throw new Error(`Subagent not found: ${step.subagent}`);
      }

      console.log(`📤 ${step.subagent} 执行: ${step.description}`);

      const result = await subagent.request(step.subagent, {
        type: step.task,
        data: step.data,
        context: results // 传递之前步骤的结果
      });

      results.push({
        subagent: step.subagent,
        result
      });
    }

    return results;
  }
}

interface WorkflowStep {
  subagent: string;
  task: string;
  description: string;
  data?: any;
}

// 使用示例
async function main() {
  const messageBus = new MessageBus();
  const registry = new SubagentRegistry(messageBus);

  // 注册 Subagents
  registry.register(new CodeGeneratorAgent('code-gen', messageBus));
  registry.register(new TestGeneratorAgent('test-gen', messageBus));
  registry.register(new DocumentationAgent('docs', messageBus));
  registry.register(new ReviewAgent('review', messageBus));

  const coordinator = new SubagentCoordinator(registry);

  // 定义工作流
  const workflow: WorkflowStep[] = [
    {
      subagent: 'code-gen',
      task: 'generate',
      description: '生成用户认证代码',
      data: { specification: '实现 JWT 认证' }
    },
    {
      subagent: 'test-gen',
      task: 'generate',
      description: '生成测试用例',
      data: { coverage: '80%' }
    },
    {
      subagent: 'review',
      task: 'security',
      description: '安全审查'
    },
    {
      subagent: 'docs',
      task: 'generate',
      description: '生成 API 文档'
    }
  ];

  const results = await coordinator.executeWorkflow(workflow);

  console.log('✅ 工作流完成:', results);
}
~~~

## 最佳实践

### 1. 拆分原则

**单一职责**：每个 Subagent 只负责一个明确的功能域

```typescript
// ✅ 好的设计
class CodeGenerator { }
class TestGenerator { }
class DocumentationGenerator { }

// ❌ 不好的设计
class DoEverythingAgent {
  generateCode() { }
  generateTests() { }
  generateDocs() { }
}
~~~

### 2. 接口设计

定义清晰的通信接口

```typescript
interface SubagentInterface {
  // 能力声明
  capabilities: string[];

  // 输入模式
  inputSchema: Record<string, any>;

  // 输出模式
  outputSchema: Record<string, any>;

  // 执行方法
  execute(request: SubagentRequest): Promise<SubagentResponse>;
}

interface SubagentRequest {
  task: string;
  input: any;
  options?: Record<string, any>;
}

interface SubagentResponse {
  success: boolean;
  output?: any;
  error?: string;
  metadata?: Record<string, any>;
}
~~~

### 3. 错误处理

```typescript
class ResilientSubagent implements SubagentInterface {
  async execute(request: SubagentRequest): Promise<SubagentResponse> {
    try {
      // 验证输入
      this.validateInput(request);

      // 执行任务
      const output = await this.doWork(request);

      return {
        success: true,
        output,
        metadata: {
          executionTime: Date.now() - request.startTime,
          agentVersion: '1.0.0'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatError(error),
        metadata: {
          errorType: error.constructor.name
        }
      };
    }
  }

  private validateInput(request: SubagentRequest): void {
    // 输入验证逻辑
  }

  private async doWork(request: SubagentRequest): Promise<any> {
    // 实际工作逻辑
  }

  private formatError(error: any): string {
    // 错误格式化逻辑
  }
}
~~~

### 4. 可观测性

```typescript
class ObservableSubagent implements SubagentInterface {
  private metrics = {
    requestsReceived: 0,
    requestsCompleted: 0,
    requestsFailed: 0,
    averageLatency: 0
  };

  async execute(request: SubagentRequest): Promise<SubagentResponse> {
    const startTime = Date.now();
    this.metrics.requestsReceived++;

    console.log(`[${this.name}] 收到请求: ${request.task}`);

    try {
      const response = await this.delegate.execute(request);

      this.metrics.requestsCompleted++;
      this.updateLatency(startTime);

      console.log(`[${this.name}] 请求完成: ${request.task}`);

      return response;
    } catch (error) {
      this.metrics.requestsFailed++;
      console.error(`[${this.name}] 请求失败:`, error);
      throw error;
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  private updateLatency(startTime: number): void {
    const latency = Date.now() - startTime;
    const total = this.metrics.requestsCompleted;
    this.metrics.averageLatency =
      (this.metrics.averageLatency * (total - 1) + latency) / total;
  }
}
~~~

### 5. 版本管理

```typescript
interface VersionedSubagent extends SubagentInterface {
  version: string;
  compatibility: string[]; // 兼容的接口版本
}

class SubagentVersionManager {
  private versions: Map<string, VersionedSubagent> = new Map();

  register(subagent: VersionedSubagent): void {
    this.versions.set(`${subagent.name}@${subagent.version}`, subagent);
  }

  get(name: string, version?: string): VersionedSubagent {
    if (version) {
      const key = `${name}@${version}`;
      const subagent = this.versions.get(key);
      if (subagent) return subagent;
    }

    // 返回最新版本
    const latest = this.findLatestVersion(name);
    if (latest) return latest;

    throw new Error(`Subagent not found: ${name}`);
  }

  private findLatestVersion(name: string): VersionedSubagent | undefined {
    const versions = Array.from(this.versions.values())
      .filter(s => s.name === name)
      .sort((a, b) => b.version.localeCompare(a.version));

    return versions[0];
  }
}
~~~

## 常见陷阱

### 1. 过度拆分

```typescript
// ❌ 过度拆分
class VariableNameAgent { }  // 只负责命名变量
class FunctionNameAgent { }  // 只负责命名函数
class ClassNameAgent { }     // 只负责命名类

// ✅ 合理拆分
class NamingAgent {  // 统一负责所有命名
  suggestName(context: NamingContext): string { }
}
~~~

### 2. 通信地狱

```typescript
// ❌ 循环依赖
Agent A -> Agent B -> Agent C -> Agent A

// ✅ 明确的依赖层次
Coordinator -> Agent A
           -> Agent B
           -> Agent C
~~~

### 3. 状态分散

```typescript
// ❌ 状态分散在多个 Subagent
Agent A.state = { user: '...' }
Agent B.state = { user: '...' }

// ✅ 集中状态管理
StateManager.shared.set('user', { ... })
~~~

## 参考资料

- [微服务架构模式](https://microservices.io/patterns/microservices.html)
- [Actor 模型](https://en.wikipedia.org/wiki/Actor_model)
- [CQRS 模式](https://martinfowler.com/bliki/CQRS.html)

---

**下一篇**：[Skill & Hook 系统：可扩展 Agent 架构](./05-skill-hook-system.md)
