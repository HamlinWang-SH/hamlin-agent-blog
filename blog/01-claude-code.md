---
title: claude-code
---

# Claude Code 深度指南：从入门到精通

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

作为 Agent 开发工程师，我发现自己在终端和代码编辑器之间不断切换，严重影响了开发效率。Claude Code 的出现彻底改变了这一现状——它不仅仅是一个 AI 编程助手，更是一个完整的命令行开发环境。在过去的几个月里，我深入使用了 Claude Code，从简单的代码补全到复杂的 Agent 技能开发，积累了大量实战经验。本文将分享我的使用心得和最佳实践。

## 核心概念

### 什么是 Claude Code？

Claude Code 是 Anthropic 推出的命令行工具，它将 Claude AI 的强大能力直接集成到你的终端工作流中。与传统的 AI 编程助手不同，Claude Code 不仅仅是一个聊天机器人，它是一个**可编程的 Agent 平台**。

### 核心特性

1. **原生终端集成**：直接在命令行中使用，无需离开你的工作环境
2. **工具系统**：内置文件操作、代码执行、浏览器自动化等工具
3. **技能系统**：可扩展的自定义命令，实现复杂自动化
4. **计划模式**：支持复杂任务的规划和分步执行
5. **内存系统**：持久化上下文，跨会话记忆关键信息

### 架构设计

~~~
┌─────────────────────────────────────────────┐
│           Claude Code CLI                    │
├─────────────────────────────────────────────┤
│  Interactive Mode  │  Single-shot Mode      │
├─────────────────────────────────────────────┤
│           Agent Orchestration                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Tools   │  │  Skills  │  │  Memory  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
├─────────────────────────────────────────────┤
│         Anthropic API (Claude 4.6)          │
└─────────────────────────────────────────────┘
~~~

## 实战示例

### 基础使用：交互式对话

首先安装 Claude Code：

```bash
npm install -g @anthropic-ai/claude-code
claude --version
~~~

启动交互式会话：

```bash
claude
~~~

基础对话示例：

```bash
# 在 Claude Code 会话中
> 解释这段代码的作用
~~~

Claude Code 会自动读取你当前的工作目录上下文，提供精准的代码解释。

### 进阶使用：工具调用

Claude Code 内置了强大的工具系统，让 AI 能够执行实际操作：

```bash
# 让 Claude 读取并分析文件
> 分析 src/auth.ts 文件的安全性

# 让 Claude 编辑文件
> 在 user.ts 中添加邮箱验证函数

# 让 Claude 执行命令
> 运行测试并修复失败的用例
~~~

### 高级用法：自定义技能

技能是 Claude Code 最强大的功能之一。让我们创建一个实用的技能：

**场景：自动化 Git 提交流程**

创建 `~/.claude/skills/auto-commit.md`：

~~~
---
name: auto-commit
description: 自动化 Git 提交流程，包括添加文件、生成提交信息和推送
---

当你被调用时，执行以下步骤：

1. 检查 Git 状态
2. 列出所有修改的文件
3. 为每个修改生成简要描述
4. 生成符合规范的提交信息
5. 添加所有文件并提交
6. 询问是否推送到远程仓库

提交信息格式：
~~~
<type>(<scope>): <subject>

<body>

<footer>
~~~

type 类型：
- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具链相关
~~~

使用这个技能：

```bash
> /auto-commit
~~~

Claude Code 会自动：
1. 运行 `git status` 查看变更
2. 分析每个文件的变化
3. 生成有意义的提交信息
4. 执行 `git add` 和 `git commit`
5. 询问是否推送

### 专家技巧：复杂 Agent 编排

创建一个多步骤的代码审查 Agent：

**文件：`~/.claude/skills/code-review.md`**

~~~
---
name: code-review
description: 深度代码审查，检查安全性、性能和最佳实践
parameters:
  - name: target
    description: 要审查的文件或目录
    required: true
---

执行以下审查流程：

## 第一阶段：静态分析
1. 读取目标文件
2. 检查代码复杂度
3. 识别潜在的安全漏洞
4. 检查错误处理

## 第二阶段：最佳实践检查
1. 验证命名规范
2. 检查类型使用
3. 评估代码可读性
4. 识别代码异味

## 第三阶段：性能分析
1. 识别性能瓶颈
2. 检查不必要的重复计算
3. 评估内存使用
4. 建议优化方向

## 输出格式
使用以下格式输出审查结果：

~~~
# 代码审查报告：{target}

## 概述
{简要总结}

## 发现的问题

### 🔴 严重问题
{列出严重问题}

### 🟡 警告
{列出警告}

### 🔵 建议
{列出改进建议}

## 详细分析
{详细分析每个问题}

## 修复建议
{提供具体的修复代码示例}
~~~
~~~

### Hooks：自动化工作流

配置 `~/.claude/settings.json` 添加自动化 hooks：

```json
{
  "hooks": {
    "beforeStart": "echo 'Starting Claude Code session' >> ~/claude.log",
    "afterComplete": [
      {
        "pattern": "*",
        "command": "echo 'Session completed at $(date)' >> ~/claude.log"
      }
    ],
    "onError": [
      {
        "pattern": "*",
        "command": "notify-send 'Claude Code Error' '${ERROR_MESSAGE}'"
      }
    ]
  }
}
~~~

## 最佳实践

### 1. 上下文管理

**问题**：会话过长时上下文会变得混乱。

**解决方案**：使用内存系统持久化关键信息：

```bash
> 记住：这个项目使用 TypeScript + Vite，主分支是 main
> /remember 项目配置：TypeScript + Vite，主分支 main
~~~

### 2. 技能模块化

**原则**：每个技能只做一件事，做好一件事。

**反例**：一个技能同时处理代码生成、测试和部署

**正例**：
- `/generate-code` - 生成代码
- `/run-tests` - 运行测试
- `/deploy` - 部署应用

### 3. 错误处理

~~~
---
name: safe-operation
description: 安全地执行可能失败的操作
---

执行操作时：
1. 先检查前置条件
2. 创建备份（如适用）
3. 执行操作
4. 验证结果
5. 失败时回滚
~~~

### 4. 性能优化

**使用批处理减少 API 调用**：

```bash
# 反模式：多次单独调用
> 分析文件1
> 分析文件2
> 分析文件3

# 优化模式：一次批量请求
> 分析 src/ 目录下的所有 .ts 文件
~~~

### 5. 调试技巧

启用详细日志：

```bash
CLAUDE_CODE_DEBUG=1 claude
~~~

查看完整的请求/响应日志，帮助调试技能和工具调用。

### 6. 安全实践

**永远不要**：
- 在技能中硬编码 API 密钥
- 将敏感信息提交到版本控制

**应该**：
- 使用环境变量
- 定期轮换密钥
- 审查技能代码中的敏感操作

### 7. 团队协作

创建团队共享的技能库：

~~~
.claude/
├── skills/
│   ├── team-standards.md    # 团队编码规范
│   ├── project-patterns.md  # 项目模式
│   └── deployment.md        # 部署流程
└── config.json
~~~

将 `.claude` 目录纳入版本控制，确保团队成员使用一致的技能集。

### 8. 持续学习

定期审查和优化你的技能：

```bash
# 每月回顾
> /list-skills
# 评估每个技能的使用频率和效果
# 删除不常用的技能
# 优化频繁使用的技能
~~~

## 高级主题

### Subagent 模式

对于复杂任务，使用子 Agent 分解问题：

~~~
---
name: complex-refactor
description: 大规模重构任务
---

1. 创建分析子任务：分析当前架构
2. 创建设计子任务：设计新架构
3. 创建实施子任务：分步实施重构
4. 创建验证子任务：验证重构结果
~~~

### 与其他工具集成

**结合 tmux**：

```bash
# 创建专门的 Claude Code 窗口
tmux new-window -n "Claude" "claude"

# 在其他窗口执行 Claude 建议的命令
tmux send-keys -t 1 "npm test" Enter
~~~

**结合 fzf**：

```bash
# 让 Claude 帮你选择文件
> 用 fzf 选择需要修改的文件
~~~

## 常见问题

### Q: 如何减少 Token 使用？

A:
1. 使用 `/remember` 存储重复信息
2. 定期使用 `/clear` 清理上下文
3. 使用具体的问题而非开放式讨论

### Q: 技能执行失败如何调试？

A:
1. 启用调试模式：`CLAUDE_CODE_DEBUG=1`
2. 检查技能语法：`/validate-skill <skill-name>`
3. 查看日志文件：`~/.claude/logs/`

### Q: 如何处理大型项目？

A:
1. 使用 `.claudeignore` 排除无关文件
2. 创建项目特定的技能
3. 使用目录级别的上下文限制

## 参考资料

- [Claude Code 官方文档](https://docs.anthropic.com/en/docs/claude-for-developers)
- [Agent SDK 参考](https://docs.anthropic.com/en/docs/agent-sdk/overview)
- [技能最佳实践](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [Claude 4.6 新特性](https://docs.anthropic.com/en/docs/about-claude/models/whats-new-claude-4-6)

---

**下一篇**：[Anthropic API 实战：构建你的第一个 AI Agent](./02-anthropic-api.md)
