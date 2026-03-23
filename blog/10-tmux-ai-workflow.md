---
title: 10-tmux-ai-workflow
---

# Tmux + AI 开发：极致高效的终端工作流

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

作为 AI 开发者，我每天在终端花费大量时间：运行代码、调试、监控日志、与 AI 对话……传统终端工作流存在明显问题：

- 窗口管理混乱，终端标签页堆积
- 频繁切换窗口打断心流
- 无法持久化工作会话
- 难以同时监控多个进程

Tmux（Terminal Multiplexer）改变了这一切。通过将 AI 工具无缝集成到 Tmux 工作流中，我构建了一个高效的开发环境。本文分享我的 Tmux + AI 开发工作流。

## 核心概念

### 什么是 Tmux？

Tmux 是一个终端复用器，允许你：

- **分屏**：在一个终端窗口中创建多个面板
- **会话管理**：持久化终端会话，断开后可恢复
- **窗口管理**：在一个会话中创建多个窗口
- **脚本化**：通过脚本自动化布局

### Tmux 架构

~~~
┌─────────────────────────────────────────────────────────┐
│                    Tmux Server                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Session (ai-dev)                     │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │  │
│  │  │   Window 1  │  │   Window 2  │  │  Window 3 │ │  │
│  │  │ ┌───┬───┐   │  │  ┌───────┐  │  │ ┌─────┐  │ │  │
│  │  │ │vim│git│   │  │  │ claude│  │  │ │test │  │ │  │
│  │  │ └───┴───┘   │  │  └───────┘  │  │ └─────┘  │ │  │
│  │  └─────────────┘  └─────────────┘  └───────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
~~~

## 实战示例

### 基础 Tmux 配置

```bash
# ~/.tmux.conf
# 设置 prefix 为 Ctrl-a（更方便）
unbind C-b
set -g prefix C-a

# 启用鼠标
set -g mouse on

# 设置窗口和面板索引从 1 开始
set -g base-index 1
setw -g pane-base-index 1

# 窗口自动重命名
set -g automatic-rename on

# 重新加载配置
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# 快速切换窗口
bind -r C-h select-window -t :-
bind -r C-l select-window -t :+

# 快速切换面板
bind -r h select-pane -L
bind -r j select-pane -D
bind -r k select-pane -U
bind -r l select-pane -R

# 分割面板
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"

# 调整面板大小
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# 复制模式设置（类似 vim）
setw -g mode-keys vi
bind -T copy-mode-vi v send -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-pipe-and-cancel "pbcopy"

# 状态栏配置
set -g status-position bottom
set -g status-justify left
set -g status-style 'bg=colour234 fg=colour137'
set -g status-left '#[fg=colour233,bg=colour245,bold] #S #[fg=colour245,bg=colour234,nobold]'
set -g status-right '#[fg=colour233,bg=colour241,bold] %Y-%m-%d #[fg=colour233,bg=colour245,bold] %H:%M:%S '
set -g status-right-length 50
set -g status-left-length 20

# 窗口状态
setw -g window-status-current-style 'fg=colour81 bg=colour238 bold'
setw -g window-status-current-format ' #I#[fg=colour250]:#[fg=colour255]#W#[fg=colour50]#F '

setw -g window-status-style 'fg=colour138 bg=colour235'
setw -g window-status-format ' #I#[fg=colour237]:#[fg=colour250]#W#[fg=colour244]#F '

# 面板边框
set -g pane-border-style 'fg=colour238'
set -g pane-active-border-style 'fg=colour81'

~~~

### AI 开发工作流脚本

```bash
#!/bin/bash
# ~/scripts/tmux-ai-dev.sh

SESSION_NAME="ai-dev"

# 检查会话是否已存在
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo "Session $SESSION_NAME already exists. Attaching..."
    tmux attach-session -t $SESSION_NAME
    exit 0
fi

# 创建新会话
tmux new-session -d -s $SESSION_NAME -n "editor"

# 窗口 1：编辑器
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:0 "nvim" C-m

# 窗口 2：AI 助手
tmux new-window -t $SESSION_NAME:1 -n "ai"
tmux send-keys -t $SESSION_NAME:1 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:1 "claude" C-m

# 窗口 3：终端 + 监控（分屏）
tmux new-window -t $SESSION_NAME:2 -n "terminal"
tmux send-keys -t $SESSION_NAME:2 "cd ~/projects/ai-agent" C-m

# 创建垂直分割
tmux split-window -h -t $SESSION_NAME:2
tmux send-keys -t $SESSION_NAME:2 "cd ~/projects/ai-agent && npm run dev" C-m

# 选择第一个窗口
tmux select-window -t $SESSION_NAME:0

# 附加到会话
tmux attach-session -t $SESSION_NAME
~~~

### 高级：自动化测试工作流

```bash
#!/bin/bash
# ~/scripts/tmux-test-workflow.sh

SESSION_NAME="test-workflow"

# 创建会话
tmux new-session -d -s $SESSION_NAME -n "main"

# 面板 1：代码编辑
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:0 "nvim src/agent.ts" C-m

# 面板 2：测试运行器（水平分割）
tmux split-window -v -t $SESSION_NAME:0
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:0 "npm test -- --watch" C-m

# 面板 3：AI 代码审查（垂直分割右侧）
tmux split-window -h -t $SESSION_NAME:0
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:0 "echo '准备 AI 代码审查...'" C-m

# 窗口 2：覆盖率报告
tmux new-window -t $SESSION_NAME:1 -n "coverage"
tmux send-keys -t $SESSION_NAME:1 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:1 "npm run test:coverage" C-m

# 窗口 3：日志监控
tmux new-window -t $SESSION_NAME:2 -n "logs"
tmux send-keys -t $SESSION_NAME:2 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:2 "tail -f logs/agent.log" C-m

tmux select-window -t $SESSION_NAME:0
tmux attach-session -t $SESSION_NAME
~~~

### Tmux 插件集成

```bash
# 安装 TPM (Tmux Plugin Manager)
git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

# ~/.tmux.conf 添加插件
set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-resurrect'
set -g @plugin 'tmux-plugins/tmux-continuum'
set -g @plugin 'tmux-plugins/tmux-yank'

# resurrect 配置（会话持久化）
set -g @resurrect-capture-pane-contents 'on'
set -g @resurrect-strategy-vim 'session'
set -g @resurrect-strategy-nvim 'session'

# continuum 配置（自动保存）
set -g @continuum-restore 'on'
set -g @continuum-save-interval '15'

# 初始化 TPM
run '~/.tmux/plugins/tpm/tpm'
~~~

### 与 Claude Code 集成

```bash
#!/bin/bash
# ~/scripts/tmux-claude.sh

SESSION_NAME="claude-dev"

tmux new-session -d -s $SESSION_NAME -n "workspace"

# 主工作区：4 分屏布局
# ┌─────────┬─────────┐
# │  vim    │ claude  │
# ├─────────┼─────────┤
# │  shell  │  test   │
# └─────────┴─────────┘

tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m

# 左上：vim
tmux send-keys -t $SESSION_NAME:0 "nvim src/agent.ts" C-m
tmux split-window -h -t $SESSION_NAME:0

# 右上：claude
tmux send-keys -t $SESSION_NAME:0 "claude" C-m
tmux split-window -v -t $SESSION_NAME:0

# 右下：测试
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent && npm test" C-m
tmux select-pane -t $SESSION_NAME:0.0
tmux split-window -v -t $SESSION_NAME:0

# 左下：shell
tmux send-keys -t $SESSION_NAME:0 "cd ~/projects/ai-agent" C-m

# 调整面板大小
tmux select-pane -t $SESSION_NAME:0.0
tmux resize-pane -R 20

# 窗口 2：git 工作区
tmux new-window -t $SESSION_NAME:1 -n "git"
tmux send-keys -t $SESSION_NAME:1 "cd ~/projects/ai-agent" C-m
tmux send-keys -t $SESSION_NAME:1 "lazygit" C-m

# 窗口 3：监控
tmux new-window -t $SESSION_NAME:2 -n "monitor"
tmux send-keys -t $SESSION_NAME:2 "cd ~/projects/ai-agent" C-m
tmux split-window -h -t $SESSION_NAME:2
tmux send-keys -t $SESSION_NAME:2 "htop" C-m
tmux select-pane -t $SESSION_NAME:2.0
tmux send-keys -t $SESSION_NAME:2 "tail -f logs/*.log" C-m

tmux select-window -t $SESSION_NAME:0
tmux attach-session -t $SESSION_NAME
~~~

### Tmux 自定义命令

```bash
# ~/.bashrc 或 ~/.zshrc

# 快速启动 AI 开发环境
alias ai-dev='~/scripts/tmux-ai-dev.sh'
alias ai-test='~/scripts/tmux-test-workflow.sh'
alias ai-claude='~/scripts/tmux-claude.sh'

# Tmux 辅助函数
# 发送命令到指定面板
tx() {
    local session=$1
    local window=$2
    local pane=$3
    shift 3
    tmux send-keys -t ${session}:${window}.${pane} "$*" C-m
}

# 示例：在 ai-dev 会话的第 0 个窗口第 1 个面板运行测试
# tx ai-dev 0 1 npm test

# 在所有面板执行命令
tx-all() {
    local session=$1
    shift
    for pane in $(tmux list-panes -t $session -F '#{pane_index}'); do
        tmux send-keys -t $session:$pane "$*" C-m
    done
}
~~~

### AI 驱动的 Tmux 自动化

```typescript
// scripts/tmux-automation.ts
import { execSync } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';

class TmuxAIController {
  private client: Anthropic;
  private session: string;

  constructor(session: string, apiKey: string) {
    this.session = session;
    this.client = new Anthropic({ apiKey });
  }

  // 获取当前工作区状态
  getWorkspaceState(): string {
    const windows = execSync(`tmux list-windows -t ${this.session} -F '#{window_index}: #{window_name}'`).toString();
    const panes = execSync(`tmux list-panes -t ${this.session} -s -F '#{window_index}.#{pane_index}: #{pane_current_command}'`).toString();

    return `Windows:\n${windows}\n\nPanes:\n${panes}`;
  }

  // 分析工作流并给出建议
  async analyzeWorkflow(): Promise<string> {
    const state = this.getWorkspaceState();

    const prompt = `分析以下 Tmux 工作区状态，给出优化建议：

${state}

请提供：
1. 当前工作流分析
2. 可能的效率改进点
3. 建议的面板布局调整
4. 自动化脚本建议`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.text || '';
  }

  // 执行 Tmux 命令
  execute(command: string): void {
    execSync(`tmux ${command}`, { stdio: 'inherit' });
  }

  // 创建自定义布局
  async createOptimalLayout(taskType: string): Promise<void> {
    let layout: string;

    switch (taskType) {
      case 'coding':
        layout = 'main-vertical'; // 适合编码的布局
        break;
      case 'testing':
        layout = 'even-horizontal'; // 测试用水平分割
        break;
      case 'debugging':
        layout = 'tiled'; // 调试用平铺布局
        break;
      default:
        layout = 'even-horizontal';
    }

    this.execute(`select-layout -t ${this.session} ${layout}`);
  }

  // 智能面板管理
  async organizeForTask(task: string): Promise<void> {
    const prompt = `对于任务 "${task}"，请生成 Tmux 命令来组织面板。

返回格式：
JSON 数组，每个元素包含：
- command: tmux 命令
- description: 命令描述

示例：
[
  {"command": "split-window -h", "description": "创建垂直分割"},
  {"command": "select-pane -t 0", "description": "选择第一个面板"}
]`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const commands = JSON.parse(textBlock?.text || '[]');

    for (const cmd of commands) {
      console.log(`执行: ${cmd.description}`);
      this.execute(`${cmd.command} -t ${this.session}`);
    }
  }
}

// 使用示例
async function main() {
  const controller = new TmuxAIController('ai-dev', process.env.ANTHROPIC_API_KEY!);

  // 分析工作流
  const analysis = await controller.analyzeWorkflow();
  console.log(analysis);

  // 为特定任务组织面板
  await controller.organizeForTask('代码审查和测试');
}

main();
~~~

## 最佳实践

### 1. 会话命名规范

```bash
# 使用描述性会话名
tmux new-session -s project-name-feature

# 示例
tmux new-session -s ai-agent-auth
tmux new-session -s blog-redesign
tmux new-session -s admin-dashboard
~~~

### 2. 快捷键优化

```bash
# ~/.tmux.conf
# 常用操作快捷键

# 快速访问常用窗口
bind 1 select-window -t 1
bind 2 select-window -t 2
bind 3 select-window -t 3
bind 4 select-window -t 4

# 快速创建特定布局
bind C-v split-window -h -p 50 -c "#{pane_current_path}"
bind C-s split-window -v -p 50 -c "#{pane_current_path}"

# 快速启动 AI 助手
bind C-i run-shell "tmux new-window -n 'ai' 'claude'"
~~~

### 3. 工作流模板

```bash
# ~/tmux-sessions/
# 不同项目类型的工作流模板

# web-dev.sh - Web 开发工作流
# api-dev.sh - API 开发工作流
# ml-dev.sh - 机器学习开发工作流
# ai-dev.sh - AI Agent 开发工作流
~~~

### 4. 状态栏增强

```bash
# ~/.tmux.conf

# 显示 CPU 和内存使用
set -g status-right '#[fg=colour233,bg=colour241,bold] #{cpu_icon} #{cpu_percentage} #[fg=colour233,bg=colour245,bold] %H:%M:%S '

# 显示 Git 分支
set -g status-left ' #{git_branch} '

# 显示会话名称
set -g status-left-length 30
set -g status-left '#[fg=colour233,bg=colour245,bold] #S #[fg=colour245,bg=colour234,nobold] '
~~~

### 5. 自动化工作流

```bash
# 项目启动时自动创建工作区
# ~/projects/ai-agent/.tmux.sh

SESSION="ai-agent"

if ! tmux has-session -t $SESSION 2>/dev/null; then
    ~/scripts/tmux-claude.sh
else
    tmux attach-session -t $SESSION
fi
~~~

## 进阶技巧

### 1. 跨面板同步输入

```bash
# 在所有面板同步输入（用于同时操作多个服务器）
bind * setw synchronize-panes on
bind = setw synchronize-panes off
~~~

### 2. 快速切换项目

```bash
# ~/.bashrc
projects=("ai-agent" "blog" "admin-dashboard")

p() {
    local project=$1
    if [[ " ${projects[@]} " =~ " ${project} " ]]; then
        tmux switch-client -t $project
    else
        echo "Project not found: $project"
    fi
}

# 使用：p ai-agent
~~~

### 3. AI 辅助调试

```typescript
// 监控面板输出，自动触发 AI 分析
class TmuxDebugAssistant {
  async monitorPane(session: string, pane: number): Promise<void> {
    // 使用 tmux capture-pane 获取输出
    const output = execSync(
      `tmux capture-pane -t ${session}:${pane} -p -S -100`
    ).toString();

    // 检测错误模式
    if (output.includes('ERROR') || output.includes('Error')) {
      console.log('检测到错误，请求 AI 分析...');

      const analysis = await this.analyzeError(output);
      console.log(analysis);
    }
  }

  private async analyzeError(errorLog: string): Promise<string> {
    // 使用 AI 分析错误
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `分析以下错误日志并提供解决方案：\n\n${errorLog}`
        }
      ]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return textBlock?.text || '';
  }
}
~~~

## 参考资料

- [Tmux 官方文档](https://github.com/tmux/tmux/wiki)
- [Tmux 快捷键速查](https://tmuxcheatsheet.com/)
- [Tmux Plugin Manager](https://github.com/tmux-plugins/tpm)

---

**系列完**：感谢阅读 Hamlin 的 Agent 开发博客系列！
