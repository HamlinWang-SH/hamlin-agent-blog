---
title: rag-agent
---

# RAG + Agent：知识库驱动的智能助手

> 作者: Hamlin | Agent 开发工程师

## 背景/动机

纯 LLM Agent 有一个致命缺陷：**知识截止日期**。模型无法访问训练后的新信息，也无法访问你的私有数据。

检索增强生成（RAG）解决了这个问题。通过将 LLM 与外部知识库结合，我们创建了一个既能理解上下文、又能访问最新信息的智能系统。

在构建企业级 AI 助手时，我发现 RAG + Agent 的组合特别强大——Agent 负责理解和规划，RAG 负责提供准确的背景信息。本文分享我的实践经验。

## 核心概念

### 什么是 RAG？

RAG（Retrieval-Augmented Generation）是一种结合信息检索和文本生成的技术：

~~~
┌─────────────────────────────────────────────────────────┐
│                     RAG 流程                            │
│                                                          │
│  用户问题 → 向量化检索 → 相关文档 → LLM 生成 → 回答    │
│             ↑                                           │
│        向量数据库                                       │
└─────────────────────────────────────────────────────────┘
~~~

### RAG + Agent 架构

~~~
┌─────────────────────────────────────────────────────────┐
│                    RAG Agent                            │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Agent Core                           │  │
│  │  • 理解用户意图                                   │  │
│  │  • 规划检索策略                                   │  │
│  │  • 整合检索结果                                   │  │
│  └───────────────────────────────────────────────────┘  │
│           ↓                    ↑                        │
│  ┌──────────────┐      ┌──────────────┐               │
│  │ 向量检索器   │      │  知识库      │               │
│  │  • 语义搜索  │      │  • 文档      │               │
│  │  • 混合检索  │      │  • 向量      │               │
│  └──────────────┘      └──────────────┘               │
└─────────────────────────────────────────────────────────┘
~~~

### 关键组件

1. **文档加载器**：从各种来源加载文档
2. **文本分割器**：将文档分割成可管理的块
3. **嵌入模型**：将文本转换为向量
4. **向量数据库**：存储和检索向量
5. **检索器**：根据查询找到相关文档
6. **生成器**：基于检索结果生成回答

## 实战示例

### 完整的 RAG Agent 实现

```typescript
// types.ts
interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

interface RetrievalResult {
  document: Document;
  score: number;
}

interface RAGConfig {
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  minSimilarity: number;
}

// embeddings.ts
import OpenAI from 'openai';

class EmbeddingService {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async embed(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts
    });

    return response.data.map(d => d.embedding);
  }
}

// vector-store.ts
class VectorStore {
  private documents: Map<string, Document> = new Map();

  add(document: Document): void {
    this.documents.set(document.id, document);
  }

  addBatch(documents: Document[]): void {
    documents.forEach(doc => this.add(doc));
  }

  async search(
    queryEmbedding: number[],
    topK: number = 5,
    minSimilarity: number = 0.7
  ): Promise<RetrievalResult[]> {
    const results: RetrievalResult[] = [];

    for (const document of this.documents.values()) {
      if (!document.embedding) continue;

      const similarity = this.cosineSimilarity(
        queryEmbedding,
        document.embedding
      );

      if (similarity >= minSimilarity) {
        results.push({ document, score: similarity });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    return dotProduct / (magnitudeA * magnitudeB);
  }

  delete(id: string): void {
    this.documents.delete(id);
  }

  clear(): void {
    this.documents.clear();
  }
}

// text-splitter.ts
class TextSplitter {
  constructor(
    private chunkSize: number = 1000,
    private chunkOverlap: number = 200
  ) {}

  split(text: string, metadata: Record<string, any> = {}): Document[] {
    const chunks: Document[] = [];
    const words = text.split(/\s+/);

    for (let i = 0; i < words.length; i += this.chunkSize - this.chunkOverlap) {
      const chunkWords = words.slice(i, i + this.chunkSize);
      const chunkText = chunkWords.join(' ');

      chunks.push({
        id: `${metadata.id || 'doc'}-${chunks.length}`,
        content: chunkText,
        metadata: {
          ...metadata,
          chunkIndex: chunks.length,
          chunkSize: chunkWords.length
        }
      });
    }

    return chunks;
  }
}

// document-loader.ts
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

class DocumentLoader {
  async loadDirectory(
    directory: string,
    extensions: string[] = ['.md', '.txt']
  ): Promise<Document[]> {
    const documents: Document[] = [];
    const files = readdirSync(directory);

    for (const file of files) {
      const filePath = join(directory, file);
      const ext = file.substring(file.lastIndexOf('.'));

      if (extensions.includes(ext)) {
        const content = readFileSync(filePath, 'utf-8');
        documents.push({
          id: file,
          content,
          metadata: {
            source: filePath,
            fileType: ext
          }
        });
      }
    }

    return documents;
  }

  async loadFile(filePath: string): Promise<Document> {
    const content = readFileSync(filePath, 'utf-8');
    return {
      id: filePath,
      content,
      metadata: { source: filePath }
    };
  }
}

// rag-agent.ts
import Anthropic from '@anthropic-ai/sdk';

class RAGAgent {
  private vectorStore: VectorStore;
  private embeddingService: EmbeddingService;
  private textSplitter: TextSplitter;
  private documentLoader: DocumentLoader;
  private llm: Anthropic;

  constructor(
    apiKey: string,
    private config: RAGConfig = {
      chunkSize: 1000,
      chunkOverlap: 200,
      topK: 5,
      minSimilarity: 0.7
    }
  ) {
    this.vectorStore = new VectorStore();
    this.embeddingService = new EmbeddingService(apiKey);
    this.textSplitter = new TextSplitter(
      config.chunkSize,
      config.chunkOverlap
    );
    this.documentLoader = new DocumentLoader();
    this.llm = new Anthropic({ apiKey });
  }

  // 添加文档到知识库
  async addDocuments(documents: Document[]): Promise<void> {
    // 分割文档
    const chunks: Document[] = [];
    for (const doc of documents) {
      const docChunks = this.textSplitter.split(doc.content, doc.metadata);
      chunks.push(...docChunks);
    }

    // 生成嵌入
    const texts = chunks.map(c => c.content);
    const embeddings = await this.embeddingService.embedBatch(texts);

    // 添加到向量存储
    chunks.forEach((chunk, i) => {
      chunk.embedding = embeddings[i];
      this.vectorStore.add(chunk);
    });

    console.log(`添加了 ${chunks.length} 个文档块`);
  }

  // 从目录加载文档
  async loadDirectory(directory: string): Promise<void> {
    const documents = await this.documentLoader.loadDirectory(directory);
    await this.addDocuments(documents);
  }

  // 查询
  async query(question: string): Promise<string> {
    // 1. 生成查询嵌入
    const queryEmbedding = await this.embeddingService.embed(question);

    // 2. 检索相关文档
    const results = await this.vectorStore.search(
      queryEmbedding,
      this.config.topK,
      this.config.minSimilarity
    );

    if (results.length === 0) {
      return '抱歉，我没有找到相关信息。';
    }

    // 3. 构建上下文
    const context = results
      .map((r, i) => `[文档 ${i + 1}] ${r.document.content}`)
      .join('\n\n');

    // 4. 使用 LLM 生成回答
    const prompt = `基于以下文档回答问题。如果文档中没有相关信息，请明确说明。

文档：
${context}

问题：${question}

回答：`;

    const response = await this.llm.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const textBlock = response.content.find(b => b.type === 'text');
    const answer = textBlock?.text || '';

    // 5. 添加引用
    const sources = results.map(r => r.document.metadata.source);
    return `${answer}\n\n参考资料：\n${sources.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
  }

  // 流式查询
  async *queryStream(question: string): AsyncGenerator<string> {
    const queryEmbedding = await this.embeddingService.embed(question);
    const results = await this.vectorStore.search(
      queryEmbedding,
      this.config.topK,
      this.config.minSimilarity
    );

    if (results.length === 0) {
      yield '抱歉，我没有找到相关信息。';
      return;
    }

    const context = results
      .map((r, i) => `[文档 ${i + 1}] ${r.document.content}`)
      .join('\n\n');

    const prompt = `基于以下文档回答问题。
文档：${context}
问题：${question}
回答：`;

    const stream = await this.llm.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
      stream: true
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        yield event.delta.text;
      }
    }
  }

  // 清除知识库
  clear(): void {
    this.vectorStore.clear();
  }

  // 获取统计信息
  getStats(): { documentCount: number } {
    return {
      documentCount: this.vectorStore['documents'].size
    };
  }
}

// 使用示例
async function main() {
  const agent = new RAGAgent(process.env.ANTHROPIC_API_KEY!);

  // 加载文档
  await agent.loadDirectory('./knowledge-base');

  // 查询
  const answer = await agent.query('如何配置 Anthropic API？');
  console.log(answer);

  // 流式查询
  for await (const chunk of agent.queryStream('什么是 RAG？')) {
    process.stdout.write(chunk);
  }
}
~~~

### 高级功能：混合检索

```typescript
class HybridRetriever {
  constructor(
    private vectorStore: VectorStore,
    private embeddingService: EmbeddingService
  ) {}

  async search(
    query: string,
    topK: number = 5
  ): Promise<RetrievalResult[]> {
    // 语义检索
    const queryEmbedding = await this.embeddingService.embed(query);
    const semanticResults = await this.vectorStore.search(queryEmbedding, topK * 2);

    // 关键词检索（简单实现）
    const keywordResults = this.keywordSearch(query, topK * 2);

    // 融合结果（RRF - Reciprocal Rank Fusion）
    return this.fusion(semanticResults, keywordResults, topK);
  }

  private keywordSearch(query: string, topK: number): RetrievalResult[] {
    const keywords = query.toLowerCase().split(/\s+/);
    const results: Map<string, RetrievalResult> = new Map();

    for (const doc of this.vectorStore['documents'].values()) {
      const content = doc.content.toLowerCase();
      let score = 0;

      for (const keyword of keywords) {
        if (content.includes(keyword)) {
          score += 1;
        }
      }

      if (score > 0) {
        results.set(doc.id, { document: doc, score: score / keywords.length });
      }
    }

    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  private fusion(
    semanticResults: RetrievalResult[],
    keywordResults: RetrievalResult[],
    topK: number
  ): RetrievalResult[] {
    const scores = new Map<string, number>();

    // RRF 算法
    const k = 60;
    semanticResults.forEach((result, i) => {
      const score = 1 / (k + i + 1);
      scores.set(result.document.id, (scores.get(result.document.id) || 0) + score);
    });

    keywordResults.forEach((result, i) => {
      const score = 1 / (k + i + 1);
      scores.set(result.document.id, (scores.get(result.document.id) || 0) + score);
    });

    // 排序并返回
    const fused = Array.from(scores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topK);

    return fused.map(([id, score]) => {
      const doc = this.vectorStore['documents'].get(id)!;
      return { document: doc, score };
    });
  }
}
~~~

### 元数据过滤

```typescript
interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in';
  value: any;
}

class FilteredVectorStore extends VectorStore {
  async search(
    queryEmbedding: number[],
    topK: number = 5,
    filters?: Filter[]
  ): Promise<RetrievalResult[]> {
    let candidates = Array.from(this['documents'].values());

    // 应用过滤器
    if (filters) {
      candidates = candidates.filter(doc => {
        return filters.every(filter => {
          const value = doc.metadata[filter.field];
          switch (filter.operator) {
            case 'eq': return value === filter.value;
            case 'ne': return value !== filter.value;
            case 'gt': return value > filter.value;
            case 'lt': return value < filter.value;
            case 'in': return Array.isArray(filter.value) && filter.value.includes(value);
            default: return true;
          }
        });
      });
    }

    // 计算相似度
    const results: RetrievalResult[] = candidates
      .filter(doc => doc.embedding)
      .map(doc => ({
        document: doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding!)
      }))
      .filter(r => r.score >= 0.7)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }
}

// 使用示例
const filteredStore = new FilteredVectorStore();

const results = await filteredStore.search(queryEmbedding, 5, [
  { field: 'category', operator: 'eq', value: 'technical' },
  { field: 'date', operator: 'gt', value: '2024-01-01' }
]);
~~~

## 最佳实践

### 1. 文档预处理

```typescript
class DocumentPreprocessor {
  clean(text: string): string {
    return text
      .replace(/\s+/g, ' ')  // 合并空白
      .replace(/[^\w\s\u4e00-\u9fa5]/g, '')  // 保留中英文
      .trim();
  }

  normalize(text: string): string {
    return text.toLowerCase();
  }
}
~~~

### 2. 上下文窗口管理

```typescript
class ContextWindowManager {
  private maxTokens = 100000;

  selectTopResults(
    results: RetrievalResult[],
    maxTokens: number = this.maxTokens
  ): RetrievalResult[] {
    const selected: RetrievalResult[] = [];
    let currentTokens = 0;

    for (const result of results) {
      const tokens = this.estimateTokens(result.document.content);

      if (currentTokens + tokens > maxTokens) {
        break;
      }

      selected.push(result);
      currentTokens += tokens;
    }

    return selected;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
~~~

### 3. 重排序（Reranking）

```typescript
class Reranker {
  async rerank(
    query: string,
    results: RetrievalResult[]
  ): Promise<RetrievalResult[]> {
    // 使用交叉注意力重新评分
    const scores = await Promise.all(
      results.map(async (result) => {
        const score = await this.crossAttentionScore(query, result.document.content);
        return { ...result, score };
      })
    );

    return scores.sort((a, b) => b.score - a.score);
  }

  private async crossAttentionScore(query: string, document: string): Promise<number> {
    // 简化实现：使用关键词重叠度
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const docWords = new Set(document.toLowerCase().split(/\s+/));

    let overlap = 0;
    for (const word of queryWords) {
      if (docWords.has(word)) {
        overlap++;
      }
    }

    return overlap / queryWords.size;
  }
}
~~~

### 4. 缓存策略

```typescript
class RAGCache {
  private cache = new Map<string, { result: string; timestamp: number }>();
  private ttl = 3600000; // 1 小时

  get(key: string): string | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.result;
    }
    this.cache.delete(key);
    return null;
  }

  set(key: string, result: string): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}
~~~

## 性能优化

### 1. 批量嵌入

```typescript
// 批量处理提高效率
async function embedDocuments(documents: Document[]): Promise<void> {
  const batchSize = 100;

  for (let i = 0; i < documents.length; i += batchSize) {
    const batch = documents.slice(i, i + batchSize);
    const texts = batch.map(d => d.content);
    const embeddings = await embeddingService.embedBatch(texts);

    batch.forEach((doc, j) => {
      doc.embedding = embeddings[j];
    });
  }
}
~~~

### 2. 异步索引

```typescript
class AsyncIndexer {
  private queue: Document[] = [];
  private processing = false;

  async add(document: Document): Promise<void> {
    this.queue.push(document);
    this.process();
  }

  private async process(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 10);
      await embedDocuments(batch);
    }

    this.processing = false;
  }
}
~~~

## 参考资料

- [RAG 论文](https://arxiv.org/abs/2005.11401)
- [LangChain RAG 教程](https://js.langchain.com/docs/tutorials/rag)
- [向量数据库对比](https://my scale.com/blog/vector-database-comparison/)

---

**下一篇**：[MCP 协议深入：模型上下文协议实战](./09-mcp-protocol.md)
