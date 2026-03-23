import{_ as n,o as a,c as i,ag as l}from"./chunks/framework.BZohXCq9.js";const E=JSON.parse('{"title":"langchain-vs-native","description":"","frontmatter":{"title":"langchain-vs-native"},"headers":[],"relativePath":"blog/07-langchain-vs-native.md","filePath":"blog/07-langchain-vs-native.md","lastUpdated":null}'),p={name:"blog/07-langchain-vs-native.md"};function e(h,s,k,r,t,c){return a(),i("div",null,[...s[0]||(s[0]=[l(`<h1 id="langchain-vs-原生开发-agent-框架选型" tabindex="-1">LangChain vs 原生开发：Agent 框架选型 <a class="header-anchor" href="#langchain-vs-原生开发-agent-框架选型" aria-label="Permalink to &quot;LangChain vs 原生开发：Agent 框架选型&quot;">​</a></h1><blockquote><p>作者: Hamlin | Agent 开发工程师</p></blockquote><h2 id="背景-动机" tabindex="-1">背景/动机 <a class="header-anchor" href="#背景-动机" aria-label="Permalink to &quot;背景/动机&quot;">​</a></h2><p>在开始构建 AI Agent 时，我面临一个重要决策：<strong>使用 LangChain 这样的框架，还是直接调用 API 原生开发？</strong></p><p>LangChain 提供了丰富的抽象和工具，可以快速启动。但随着项目复杂度增加，我发现框架的限制也逐渐显现。另一方面，原生开发提供了最大的灵活性，但需要处理更多底层细节。</p><p>经过多个项目的实践，我总结出了这套选型指南，帮助你根据项目特点做出最佳选择。</p><h2 id="核心概念" tabindex="-1">核心概念 <a class="header-anchor" href="#核心概念" aria-label="Permalink to &quot;核心概念&quot;">​</a></h2><h3 id="langchain" tabindex="-1">LangChain <a class="header-anchor" href="#langchain" aria-label="Permalink to &quot;LangChain&quot;">​</a></h3><p>LangChain 是一个流行的 LLM 应用开发框架，提供了：</p><ul><li><strong>链式调用</strong>：将多个组件串联成复杂流程</li><li><strong>记忆管理</strong>：内置多种记忆模式</li><li><strong>工具集成</strong>：丰富的预置工具</li><li><strong>Agent 抽象</strong>：开箱即用的 Agent 实现</li><li><strong>向量存储集成</strong>：与多个向量数据库的集成</li></ul><h3 id="原生开发" tabindex="-1">原生开发 <a class="header-anchor" href="#原生开发" aria-label="Permalink to &quot;原生开发&quot;">​</a></h3><p>直接使用 AI 模型提供商的 API：</p><ul><li><strong>完全控制</strong>：对每个请求和响应有完全控制</li><li><strong>零依赖</strong>：只依赖官方 SDK</li><li><strong>性能优化</strong>：可以针对特定场景深度优化</li><li><strong>学习曲线</strong>：需要更多底层知识</li></ul><h3 id="对比维度" tabindex="-1">对比维度 <a class="header-anchor" href="#对比维度" aria-label="Permalink to &quot;对比维度&quot;">​</a></h3><table tabindex="0"><thead><tr><th>维度</th><th>LangChain</th><th>原生开发</th></tr></thead><tbody><tr><td>启动速度</td><td>⚡ 快</td><td>🐌 慢</td></tr><tr><td>灵活性</td><td>🔸 中</td><td>🔥 高</td></tr><tr><td>抽象级别</td><td>🔺 高</td><td>🔻 低</td></tr><tr><td>学习曲线</td><td>📉 平缓</td><td>📈 陡峭</td></tr><tr><td>调试难度</td><td>🔸 中</td><td>🔹 低</td></tr><tr><td>依赖复杂度</td><td>🔺 高</td><td>🔻 低</td></tr><tr><td>性能控制</td><td>🔸 中</td><td>🔥 高</td></tr></tbody></table><h2 id="实战示例" tabindex="-1">实战示例 <a class="header-anchor" href="#实战示例" aria-label="Permalink to &quot;实战示例&quot;">​</a></h2><h3 id="场景-1-简单问答机器人" tabindex="-1">场景 1：简单问答机器人 <a class="header-anchor" href="#场景-1-简单问答机器人" aria-label="Permalink to &quot;场景 1：简单问答机器人&quot;">​</a></h3><p><strong>使用 LangChain</strong></p><div class="language-typescript vp-adaptive-theme line-numbers-mode"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatOpenAI } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { PromptTemplate } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/core/prompts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { StringOutputParser } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/core/output_parsers&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> llm</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatOpenAI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  modelName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;gpt-4&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  temperature: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.7</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PromptTemplate.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">fromTemplate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;你是一个有帮助的助手。请回答：{question}&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> chain</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> prompt.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(llm).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StringOutputParser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> chain.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">invoke</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ question: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;什么是 LangChain？&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(response);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">使用原生开发</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`typescript</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import OpenAI from &#39;openai&#39;;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const client = new OpenAI();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const response = await client.chat.completions.create({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  model: &#39;gpt-4&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  messages: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      role: &#39;system&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      content: &#39;你是一个有帮助的助手。&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      role: &#39;user&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      content: &#39;什么是 LangChain？&#39;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  ],</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  temperature: 0.7</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">console.log(response.choices[0].message.content);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**分析**：对于简单场景，原生代码更简洁直接。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 场景 2：带记忆的对话</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**使用 LangChain**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatOpenAI } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ConversationBufferMemory } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;langchain/memory&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ConversationChain } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;langchain/chains&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> llm</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatOpenAI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ modelName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;gpt-4&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> memory</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationBufferMemory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  returnMessages: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  memoryKey: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;history&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> chain</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConversationChain</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  llm,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  memory</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 第一次对话</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> chain.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">call</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ input: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;我叫 Hamlin&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 第二次对话（记住之前的内容）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> chain.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">call</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ input: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;我叫什么名字？&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">使用原生开发</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`typescript</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import OpenAI from &#39;openai&#39;;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const client = new OpenAI();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">class ConversationMemory {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  private messages: Array&lt;{ role: string; content: string }&gt; = [];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  add(role: string, content: string): void {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    this.messages.push({ role, content });</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  getMessages(): Array&lt;{ role: string; content: string }&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    return [...this.messages];</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const memory = new ConversationMemory();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">async function chat(userInput: string): Promise&lt;string&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  memory.add(&#39;user&#39;, userInput);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const response = await client.chat.completions.create({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    model: &#39;gpt-4&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    messages: [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      { role: &#39;system&#39;, content: &#39;你是一个有帮助的助手。&#39; },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      ...memory.getMessages()</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const assistantMessage = response.choices[0].message.content || &#39;&#39;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  memory.add(&#39;assistant&#39;, assistantMessage);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  return assistantMessage;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">await chat(&#39;我叫 Hamlin&#39;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">await chat(&#39;我叫什么名字？&#39;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**分析**：LangChain 的记忆管理更方便，但原生实现也不复杂。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 场景 3：工具调用 Agent</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**使用 LangChain**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatOpenAI } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { AgentExecutor, createReactAgent } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;langchain/agents&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { DynamicTool } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;langchain/tools&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> llm</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatOpenAI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ modelName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;gpt-4&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> tools</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DynamicTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;calculator&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;用于数学计算&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> eval</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(input).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }),</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DynamicTool</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;search&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    description: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;搜索信息&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    func</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 实现搜索逻辑</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`搜索结果：\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">input</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createReactAgent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ llm, tools });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> agent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AgentExecutor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  agent: prompt,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  tools</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> agent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">invoke</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  input: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;计算 123 * 456&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">使用原生开发</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">**</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`typescript</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">import OpenAI from &#39;openai&#39;;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const client = new OpenAI();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">interface Tool {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  name: string;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  description: string;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  parameters: any;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  execute: (params: any) =&gt; Promise&lt;string&gt;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const tools: Tool[] = [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    name: &#39;calculator&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    description: &#39;用于数学计算&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    parameters: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      type: &#39;object&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      properties: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        expression: { type: &#39;string&#39;, description: &#39;数学表达式&#39; }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      required: [&#39;expression&#39;]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    execute: async (params) =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      return eval(params.expression).toString();</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    name: &#39;search&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    description: &#39;搜索信息&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    parameters: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      type: &#39;object&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      properties: {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        query: { type: &#39;string&#39;, description: &#39;搜索关键词&#39; }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      required: [&#39;query&#39;]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    execute: async (params) =&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      return \`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">搜索结果：\${params.query}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">async function runAgent(userMessage: string): Promise&lt;string&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  const messages = [</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      role: &#39;system&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      content: \`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">你是一个有用的助手。你可以使用以下工具：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${tools.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">map</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">t</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`- \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}: \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">t</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">description</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">当需要使用工具时，以 </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 格式响应：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;tool&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;工具名&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;parameters&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: {</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    },</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    { role: &#39;user&#39;, content: userMessage }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  ];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  let maxIterations = 10;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  let iteration = 0;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  while (iteration &lt; maxIterations) {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    iteration++;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    const response = await client.chat.completions.create({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      model: &#39;gpt-4&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      messages</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    const content = response.choices[0].message.content || &#39;&#39;;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    // 检查是否需要调用工具</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    const toolMatch = content.match(/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\{</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\s\\S</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">]*&quot;tool&quot;[</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\s\\S</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">]*</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">/);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    if (toolMatch) {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      const toolCall = JSON.parse(toolMatch[0]);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      const tool = tools.find(t =&gt; t.name === toolCall.tool);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      if (tool) {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        const result = await tool.execute(toolCall.parameters);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        messages.push({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          role: &#39;assistant&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          content: JSON.stringify(toolCall)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        messages.push({</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          role: &#39;user&#39;,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">          content: \`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">工具 \${tool.name} 的返回结果：\${result}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        continue;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    // 不需要工具调用，返回最终答案</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    return content;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  throw new Error(&#39;超过最大迭代次数&#39;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">const result = await runAgent(&#39;计算 123 * 456&#39;);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">console.log(result);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**分析**：原生实现需要更多代码，但提供了完全的控制权。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 选型决策框架</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 使用 LangChain 的场景</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. **快速原型开发**：需要快速验证想法</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. **标准工作流**：使用常见的链式调用模式</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. **团队协作**：团队成员对 LangChain 熟悉</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. **丰富集成**：需要使用 LangChain 生态的工具</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 使用原生开发的场景</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. **性能关键**：需要极致的性能优化</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. **特殊需求**：框架无法满足的特殊逻辑</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. **长期维护**：担心框架版本升级带来的破坏性变更</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. **学习目的**：深入理解底层机制</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 混合方案</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 结合两者的优点</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ChatOpenAI } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@langchain/openai&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Anthropic </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@anthropic-ai/sdk&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用 LangChain 处理标准流程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> langchainLLM</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ChatOpenAI</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ modelName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;gpt-4&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> });</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用原生 API 处理特殊需求</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> anthropicClient</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Anthropic</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> hybridAgent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Promise</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 简单对话使用 LangChain</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (input.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 100</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> langchainLLM.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">invoke</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(input);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 复杂任务使用 Claude + 工具调用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> anthropicClient.messages.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    model: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;claude-3-5-sonnet-20241022&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    max_tokens: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4096</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    tools: [</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">## 最佳实践</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 抽象层设计</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">无论选择哪种方案，都应该创建抽象层：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`typescript</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">// 定义统一的接口</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">interface LLMProvider {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  chat(messages: Message[]): Promise&lt;string&gt;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  stream(messages: Message[]): AsyncIterable&lt;string&gt;;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">// LangChain 实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">class LangChainProvider implements LLMProvider {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  async chat(messages: Message[]): Promise&lt;string&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    // LangChain 实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">// 原生实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">class NativeProvider implements LLMProvider {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  async chat(messages: Message[]): Promise&lt;string&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    // 原生 API 实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">// 使用工厂模式</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">class LLMProviderFactory {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  static create(type: &#39;langchain&#39; | &#39;native&#39;): LLMProvider {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    switch (type) {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      case &#39;langchain&#39;:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        return new LangChainProvider();</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      case &#39;native&#39;:</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        return new NativeProvider();</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 2. 配置驱动</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">typescript</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// config.ts</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  provider: process.env.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">LLM_PROVIDER</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;native&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  model: process.env.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">LLM_MODEL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;claude-3-5-sonnet-20241022&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  temperature: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">parseFloat</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(process.env.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">LLM_TEMPERATURE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;0.7&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用配置</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> provider</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LLMProviderFactory.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">create</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(config.provider);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">### </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 渐进式迁移</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`\`\`typescript</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">// 从 LangChain 开始，逐步迁移到原生</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">class HybridAgent {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  private useNative = false;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  async chat(input: string): Promise&lt;string&gt; {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    if (this.useNative) {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">      return this.nativeChat(input);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    return this.langchainChat(input);</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  enableNative(): void {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    this.useNative = true;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  }</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 性能对比</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 请求延迟</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| 方案 | 冷启动 | 首次请求 | 后续请求 |</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">|------|--------|----------|----------|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| LangChain | ~2s | ~500ms | ~300ms |</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| 原生 | ~500ms | ~200ms | ~150ms |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 内存占用</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| 方案 | 基础 | 10 并发 | 100 并发 |</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">|------|------|---------|----------|</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| LangChain | ~100MB | ~300MB | ~2GB |</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">| 原生 | ~30MB | ~100MB | ~500MB |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 迁移指南</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 从 LangChain 到原生</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. **识别关键依赖**：记录使用的 LangChain 功能</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. **实现等价功能**：用原生代码实现</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. **逐步替换**：一次替换一个组件</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. **充分测试**：确保行为一致</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">### 从原生到 LangChain</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">1. **评估需求**：确定 LangChain 能带来价值</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">2. **学习框架**：理解 LangChain 的抽象</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">3. **重构代码**：将原生代码迁移到 LangChain</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">4. **利用特性**：使用 LangChain 的额外功能</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 决策树</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">是否需要快速启动？</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">├── 是 → LangChain</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">└── 否 → 是否有特殊性能需求？</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    ├── 是 → 原生开发</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    └── 否 → 是否需要深度定制？</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        ├── 是 → 原生开发</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        └── 否 → LangChain</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">~~~</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">## 参考资料</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- [LangChain 官方文档](https://js.langchain.com/)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- [OpenAI API 文档](https://platform.openai.com/docs/api-reference)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">- [Anthropic API 文档](https://docs.anthropic.com/en/api/getting-started)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">---</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">**下一篇**：[RAG + Agent：知识库驱动的智能助手](./08-rag-agent.md)</span></span></code></pre><div class="line-numbers-wrapper" aria-hidden="true"><span class="line-number">1</span><br><span class="line-number">2</span><br><span class="line-number">3</span><br><span class="line-number">4</span><br><span class="line-number">5</span><br><span class="line-number">6</span><br><span class="line-number">7</span><br><span class="line-number">8</span><br><span class="line-number">9</span><br><span class="line-number">10</span><br><span class="line-number">11</span><br><span class="line-number">12</span><br><span class="line-number">13</span><br><span class="line-number">14</span><br><span class="line-number">15</span><br><span class="line-number">16</span><br><span class="line-number">17</span><br><span class="line-number">18</span><br><span class="line-number">19</span><br><span class="line-number">20</span><br><span class="line-number">21</span><br><span class="line-number">22</span><br><span class="line-number">23</span><br><span class="line-number">24</span><br><span class="line-number">25</span><br><span class="line-number">26</span><br><span class="line-number">27</span><br><span class="line-number">28</span><br><span class="line-number">29</span><br><span class="line-number">30</span><br><span class="line-number">31</span><br><span class="line-number">32</span><br><span class="line-number">33</span><br><span class="line-number">34</span><br><span class="line-number">35</span><br><span class="line-number">36</span><br><span class="line-number">37</span><br><span class="line-number">38</span><br><span class="line-number">39</span><br><span class="line-number">40</span><br><span class="line-number">41</span><br><span class="line-number">42</span><br><span class="line-number">43</span><br><span class="line-number">44</span><br><span class="line-number">45</span><br><span class="line-number">46</span><br><span class="line-number">47</span><br><span class="line-number">48</span><br><span class="line-number">49</span><br><span class="line-number">50</span><br><span class="line-number">51</span><br><span class="line-number">52</span><br><span class="line-number">53</span><br><span class="line-number">54</span><br><span class="line-number">55</span><br><span class="line-number">56</span><br><span class="line-number">57</span><br><span class="line-number">58</span><br><span class="line-number">59</span><br><span class="line-number">60</span><br><span class="line-number">61</span><br><span class="line-number">62</span><br><span class="line-number">63</span><br><span class="line-number">64</span><br><span class="line-number">65</span><br><span class="line-number">66</span><br><span class="line-number">67</span><br><span class="line-number">68</span><br><span class="line-number">69</span><br><span class="line-number">70</span><br><span class="line-number">71</span><br><span class="line-number">72</span><br><span class="line-number">73</span><br><span class="line-number">74</span><br><span class="line-number">75</span><br><span class="line-number">76</span><br><span class="line-number">77</span><br><span class="line-number">78</span><br><span class="line-number">79</span><br><span class="line-number">80</span><br><span class="line-number">81</span><br><span class="line-number">82</span><br><span class="line-number">83</span><br><span class="line-number">84</span><br><span class="line-number">85</span><br><span class="line-number">86</span><br><span class="line-number">87</span><br><span class="line-number">88</span><br><span class="line-number">89</span><br><span class="line-number">90</span><br><span class="line-number">91</span><br><span class="line-number">92</span><br><span class="line-number">93</span><br><span class="line-number">94</span><br><span class="line-number">95</span><br><span class="line-number">96</span><br><span class="line-number">97</span><br><span class="line-number">98</span><br><span class="line-number">99</span><br><span class="line-number">100</span><br><span class="line-number">101</span><br><span class="line-number">102</span><br><span class="line-number">103</span><br><span class="line-number">104</span><br><span class="line-number">105</span><br><span class="line-number">106</span><br><span class="line-number">107</span><br><span class="line-number">108</span><br><span class="line-number">109</span><br><span class="line-number">110</span><br><span class="line-number">111</span><br><span class="line-number">112</span><br><span class="line-number">113</span><br><span class="line-number">114</span><br><span class="line-number">115</span><br><span class="line-number">116</span><br><span class="line-number">117</span><br><span class="line-number">118</span><br><span class="line-number">119</span><br><span class="line-number">120</span><br><span class="line-number">121</span><br><span class="line-number">122</span><br><span class="line-number">123</span><br><span class="line-number">124</span><br><span class="line-number">125</span><br><span class="line-number">126</span><br><span class="line-number">127</span><br><span class="line-number">128</span><br><span class="line-number">129</span><br><span class="line-number">130</span><br><span class="line-number">131</span><br><span class="line-number">132</span><br><span class="line-number">133</span><br><span class="line-number">134</span><br><span class="line-number">135</span><br><span class="line-number">136</span><br><span class="line-number">137</span><br><span class="line-number">138</span><br><span class="line-number">139</span><br><span class="line-number">140</span><br><span class="line-number">141</span><br><span class="line-number">142</span><br><span class="line-number">143</span><br><span class="line-number">144</span><br><span class="line-number">145</span><br><span class="line-number">146</span><br><span class="line-number">147</span><br><span class="line-number">148</span><br><span class="line-number">149</span><br><span class="line-number">150</span><br><span class="line-number">151</span><br><span class="line-number">152</span><br><span class="line-number">153</span><br><span class="line-number">154</span><br><span class="line-number">155</span><br><span class="line-number">156</span><br><span class="line-number">157</span><br><span class="line-number">158</span><br><span class="line-number">159</span><br><span class="line-number">160</span><br><span class="line-number">161</span><br><span class="line-number">162</span><br><span class="line-number">163</span><br><span class="line-number">164</span><br><span class="line-number">165</span><br><span class="line-number">166</span><br><span class="line-number">167</span><br><span class="line-number">168</span><br><span class="line-number">169</span><br><span class="line-number">170</span><br><span class="line-number">171</span><br><span class="line-number">172</span><br><span class="line-number">173</span><br><span class="line-number">174</span><br><span class="line-number">175</span><br><span class="line-number">176</span><br><span class="line-number">177</span><br><span class="line-number">178</span><br><span class="line-number">179</span><br><span class="line-number">180</span><br><span class="line-number">181</span><br><span class="line-number">182</span><br><span class="line-number">183</span><br><span class="line-number">184</span><br><span class="line-number">185</span><br><span class="line-number">186</span><br><span class="line-number">187</span><br><span class="line-number">188</span><br><span class="line-number">189</span><br><span class="line-number">190</span><br><span class="line-number">191</span><br><span class="line-number">192</span><br><span class="line-number">193</span><br><span class="line-number">194</span><br><span class="line-number">195</span><br><span class="line-number">196</span><br><span class="line-number">197</span><br><span class="line-number">198</span><br><span class="line-number">199</span><br><span class="line-number">200</span><br><span class="line-number">201</span><br><span class="line-number">202</span><br><span class="line-number">203</span><br><span class="line-number">204</span><br><span class="line-number">205</span><br><span class="line-number">206</span><br><span class="line-number">207</span><br><span class="line-number">208</span><br><span class="line-number">209</span><br><span class="line-number">210</span><br><span class="line-number">211</span><br><span class="line-number">212</span><br><span class="line-number">213</span><br><span class="line-number">214</span><br><span class="line-number">215</span><br><span class="line-number">216</span><br><span class="line-number">217</span><br><span class="line-number">218</span><br><span class="line-number">219</span><br><span class="line-number">220</span><br><span class="line-number">221</span><br><span class="line-number">222</span><br><span class="line-number">223</span><br><span class="line-number">224</span><br><span class="line-number">225</span><br><span class="line-number">226</span><br><span class="line-number">227</span><br><span class="line-number">228</span><br><span class="line-number">229</span><br><span class="line-number">230</span><br><span class="line-number">231</span><br><span class="line-number">232</span><br><span class="line-number">233</span><br><span class="line-number">234</span><br><span class="line-number">235</span><br><span class="line-number">236</span><br><span class="line-number">237</span><br><span class="line-number">238</span><br><span class="line-number">239</span><br><span class="line-number">240</span><br><span class="line-number">241</span><br><span class="line-number">242</span><br><span class="line-number">243</span><br><span class="line-number">244</span><br><span class="line-number">245</span><br><span class="line-number">246</span><br><span class="line-number">247</span><br><span class="line-number">248</span><br><span class="line-number">249</span><br><span class="line-number">250</span><br><span class="line-number">251</span><br><span class="line-number">252</span><br><span class="line-number">253</span><br><span class="line-number">254</span><br><span class="line-number">255</span><br><span class="line-number">256</span><br><span class="line-number">257</span><br><span class="line-number">258</span><br><span class="line-number">259</span><br><span class="line-number">260</span><br><span class="line-number">261</span><br><span class="line-number">262</span><br><span class="line-number">263</span><br><span class="line-number">264</span><br><span class="line-number">265</span><br><span class="line-number">266</span><br><span class="line-number">267</span><br><span class="line-number">268</span><br><span class="line-number">269</span><br><span class="line-number">270</span><br><span class="line-number">271</span><br><span class="line-number">272</span><br><span class="line-number">273</span><br><span class="line-number">274</span><br><span class="line-number">275</span><br><span class="line-number">276</span><br><span class="line-number">277</span><br><span class="line-number">278</span><br><span class="line-number">279</span><br><span class="line-number">280</span><br><span class="line-number">281</span><br><span class="line-number">282</span><br><span class="line-number">283</span><br><span class="line-number">284</span><br><span class="line-number">285</span><br><span class="line-number">286</span><br><span class="line-number">287</span><br><span class="line-number">288</span><br><span class="line-number">289</span><br><span class="line-number">290</span><br><span class="line-number">291</span><br><span class="line-number">292</span><br><span class="line-number">293</span><br><span class="line-number">294</span><br><span class="line-number">295</span><br><span class="line-number">296</span><br><span class="line-number">297</span><br><span class="line-number">298</span><br><span class="line-number">299</span><br><span class="line-number">300</span><br><span class="line-number">301</span><br><span class="line-number">302</span><br><span class="line-number">303</span><br><span class="line-number">304</span><br><span class="line-number">305</span><br><span class="line-number">306</span><br><span class="line-number">307</span><br><span class="line-number">308</span><br><span class="line-number">309</span><br><span class="line-number">310</span><br><span class="line-number">311</span><br><span class="line-number">312</span><br><span class="line-number">313</span><br><span class="line-number">314</span><br><span class="line-number">315</span><br><span class="line-number">316</span><br><span class="line-number">317</span><br><span class="line-number">318</span><br><span class="line-number">319</span><br><span class="line-number">320</span><br><span class="line-number">321</span><br><span class="line-number">322</span><br><span class="line-number">323</span><br><span class="line-number">324</span><br><span class="line-number">325</span><br><span class="line-number">326</span><br><span class="line-number">327</span><br><span class="line-number">328</span><br><span class="line-number">329</span><br><span class="line-number">330</span><br><span class="line-number">331</span><br><span class="line-number">332</span><br><span class="line-number">333</span><br><span class="line-number">334</span><br><span class="line-number">335</span><br><span class="line-number">336</span><br><span class="line-number">337</span><br><span class="line-number">338</span><br><span class="line-number">339</span><br><span class="line-number">340</span><br><span class="line-number">341</span><br><span class="line-number">342</span><br><span class="line-number">343</span><br><span class="line-number">344</span><br><span class="line-number">345</span><br><span class="line-number">346</span><br><span class="line-number">347</span><br><span class="line-number">348</span><br><span class="line-number">349</span><br><span class="line-number">350</span><br><span class="line-number">351</span><br><span class="line-number">352</span><br><span class="line-number">353</span><br><span class="line-number">354</span><br><span class="line-number">355</span><br><span class="line-number">356</span><br><span class="line-number">357</span><br><span class="line-number">358</span><br><span class="line-number">359</span><br><span class="line-number">360</span><br><span class="line-number">361</span><br><span class="line-number">362</span><br><span class="line-number">363</span><br><span class="line-number">364</span><br><span class="line-number">365</span><br><span class="line-number">366</span><br><span class="line-number">367</span><br><span class="line-number">368</span><br><span class="line-number">369</span><br><span class="line-number">370</span><br><span class="line-number">371</span><br><span class="line-number">372</span><br><span class="line-number">373</span><br><span class="line-number">374</span><br><span class="line-number">375</span><br><span class="line-number">376</span><br><span class="line-number">377</span><br><span class="line-number">378</span><br><span class="line-number">379</span><br><span class="line-number">380</span><br><span class="line-number">381</span><br><span class="line-number">382</span><br><span class="line-number">383</span><br><span class="line-number">384</span><br><span class="line-number">385</span><br><span class="line-number">386</span><br><span class="line-number">387</span><br><span class="line-number">388</span><br><span class="line-number">389</span><br><span class="line-number">390</span><br><span class="line-number">391</span><br><span class="line-number">392</span><br><span class="line-number">393</span><br><span class="line-number">394</span><br><span class="line-number">395</span><br><span class="line-number">396</span><br><span class="line-number">397</span><br><span class="line-number">398</span><br><span class="line-number">399</span><br><span class="line-number">400</span><br><span class="line-number">401</span><br><span class="line-number">402</span><br><span class="line-number">403</span><br><span class="line-number">404</span><br><span class="line-number">405</span><br><span class="line-number">406</span><br><span class="line-number">407</span><br><span class="line-number">408</span><br><span class="line-number">409</span><br><span class="line-number">410</span><br><span class="line-number">411</span><br><span class="line-number">412</span><br><span class="line-number">413</span><br><span class="line-number">414</span><br><span class="line-number">415</span><br><span class="line-number">416</span><br><span class="line-number">417</span><br><span class="line-number">418</span><br><span class="line-number">419</span><br><span class="line-number">420</span><br><span class="line-number">421</span><br><span class="line-number">422</span><br><span class="line-number">423</span><br><span class="line-number">424</span><br><span class="line-number">425</span><br><span class="line-number">426</span><br><span class="line-number">427</span><br><span class="line-number">428</span><br><span class="line-number">429</span><br><span class="line-number">430</span><br><span class="line-number">431</span><br><span class="line-number">432</span><br><span class="line-number">433</span><br><span class="line-number">434</span><br><span class="line-number">435</span><br><span class="line-number">436</span><br><span class="line-number">437</span><br></div></div>`,19)])])}const b=n(p,[["render",e]]);export{E as __pageData,b as default};
