import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Hamlin\'s Agent Blog',
  description: 'AI Agent 开发实战经验分享',
  lang: 'zh-CN',
  base: '/hamlin-agent-blog/',
  head: [
    ['link', { rel: 'icon', href: '/hamlin-agent-blog/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c8772' }]
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/01-claude-code' },
      { text: '关于', link: '/about' }
    ],

    sidebar: {
      '/blog/': [
        {
          text: '全部文章',
          items: [
            { text: '01. Claude Code 深度指南', link: '/blog/01-claude-code' },
            { text: '02. Anthropic API 实战', link: '/blog/02-anthropic-api' },
            { text: '03. Agent Swarm 架构', link: '/blog/03-agent-swarm' },
            { text: '04. Subagent 设计', link: '/blog/04-subagent-design' },
            { text: '05. Skill & Hook 系统', link: '/blog/05-skill-hook-system' },
            { text: '06. Hapi.run 平台', link: '/blog/06-hapi-run' },
            { text: '07. LangChain vs 原生', link: '/blog/07-langchain-vs-native' },
            { text: '08. RAG + Agent', link: '/blog/08-rag-agent' },
            { text: '09. MCP 协议', link: '/blog/09-mcp-protocol' },
            { text: '10. Tmux + AI 开发', link: '/blog/10-tmux-ai-workflow' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hamlin' }
    ],

    footer: {
      message: '基于 VitePress 构建',
      copyright: '© 2024 Hamlin'
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/hamlin/hamlin-agent-blog/edit/main/blog-posts/:path',
      text: '在 GitHub 上编辑此页'
    },

    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'full',
        timeStyle: 'short'
      }
    }
  },

  markdown: {
    lineNumbers: true,
    codeTransformers: [
      {
        post: (code, node) => {
          if (/\b(vue|react|angular)\b/.test(code)) {
            return code + '\n// Framework specific code'
          }
          return code
        }
      }
    ]
  }
})
