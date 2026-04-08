# RAG模块文档 - 基金销售智能问答系统

## 概述

RAG（Retrieval-Augmented Generation，检索增强生成）模块是基金销售智能问答系统的核心组件之一，专门处理金融知识相关的问题。该模块通过结合知识库检索和大语言模型生成，为用户提供准确、专业的金融知识解答。

## 系统架构

### 核心组件

```
RAG模块
├── document_loader.py    # 文档加载器
├── text_splitter.py      # 文本分块器  
├── vector_store.py       # 向量存储管理
├── retriever.py          # 检索器管理
└── chain.py              # RAG链核心逻辑
```

### 工作流程

```
用户问题 → 意图识别 → 知识库检索 → 文档分块 → 向量相似度搜索 → 上下文构建 → LLM生成回答
```

## 详细实现

### 1. 文档加载器（document_loader.py）

**功能**：加载和管理知识库文档

**主要功能**：
- 支持TXT格式文档加载
- 自动扫描知识库目录
- 文档元数据管理

**核心代码**：
```python
def load_knowledge_directory(knowledge_path: str) -> List[Document]:
    """加载知识库目录下的所有txt文件"""
    documents = []
    for file_name in os.listdir(knowledge_path):
        if file_name.endswith('.txt'):
            # 加载文档内容并创建Document对象
            content = load_txt_file(file_path)
            doc = Document(
                page_content=content,
                metadata={"source": file_name, "file_path": file_path}
            )
            documents.append(doc)
    return documents
```

**知识库结构**：
```
fund-agent/src/rag/knowledge/
├── 产品规则.txt      # 基金销售规则、费率、合规要求
└── 金融知识.txt      # 股票、基金、债券等金融基础知识
```

### 2. 文本分块器（text_splitter.py）

**功能**：将长文档分割成适合检索的文本块

**设计考虑**：
- 中文文本优化处理
- 保持语义完整性
- 支持重叠分块避免信息丢失

**核心参数**：
```python
chunk_size=500      # 每块约500字符
chunk_overlap=50    # 重叠50字符保持上下文
separators=[        # 分隔符优先级
    "\n\n", "\n", "。", ".", "；", ";", 
    "，", ",", " ", ""
]
```

### 3. 向量存储（vector_store.py）

**功能**：文档嵌入和向量存储管理

**支持的向量数据库**：
- **Chroma**：轻量级，支持持久化
- **FAISS**：Facebook开源，检索速度快

**嵌入模型**：
```python
class DashscopeEmbeddings(Embeddings):
    """通义千问text-embedding-v1模型"""
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        # 调用通义千问API生成文本嵌入
        response = TextEmbedding.call(model="text-embedding-v1", input=text)
        return embedding
```

**向量存储流程**：
1. 文档加载 → 2. 文本分块 → 3. 生成嵌入 → 4. 存储到向量数据库

### 4. 检索器（retriever.py）

**功能**：从向量存储中检索相关文档

**检索方式**：
- **相似度检索**：基于向量相似度
- **MMR检索**：Maximal Marginal Relevance，平衡相关性和多样性

**核心函数**：
```python
def retrieve_documents(question: str, k: int = 4) -> List[Document]:
    """检索相关文档"""
    retriever = vector_store.as_retriever(search_kwargs={"k": k})
    return retriever.invoke(question)

def format_retrieved_context(documents: List[Document]) -> str:
    """格式化检索结果为上下文"""
    context_parts = []
    for i, doc in enumerate(documents, 1):
        source = doc.metadata.get("source", "未知来源")
        content = doc.page_content
        context_parts.append(f"【文档 {i}】来源: {source\n{content}")
    return "\n\n".join(context_parts)
```

### 5. RAG链（chain.py）

**功能**：核心RAG流程编排

**主要功能**：
- 意图识别：判断是否为知识库问题
- RAG查询：同步和流式回答
- 链式构建：LangChain集成

#### 意图识别算法

```python
def is_rag_question(question: str) -> bool:
    # 数据库关键词 - 涉及具体数据查询的不走RAG
    db_keywords = ["产品", "客户", "持仓", "跟进", "销售额", "业绩", "公司", "姓名", "电话"]
    
    # RAG关键词 - 金融知识相关
    rag_keywords = [
        "产品说明", "基金合同", "费率", "费用", "投资策略", "风险等级",
        "基金经理", "产品特点", "赎回", "认购", "封闭期", "合规",
        "股票型", "债券型", "混合型基金", "基金定投", "风险承受能力",
        # ... 更多金融术语
    ]
    
    # 逻辑：涉及数据库查询的优先走SQL，纯知识问题走RAG
    is_db_query = any(kw in question for kw in db_keywords)
    has_rag_keyword = any(kw in question for kw in rag_keywords)
    
    if is_db_query:
        return False  # 数据库查询不走RAG
    return has_rag_keyword  # 只有金融知识问题才走RAG
```

#### RAG提示词模板

```python
RAG_QA_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""你是一个专业的基金销售知识库问答助手。

请根据以下检索到的知识库内容回答用户的问题。

## 知识库内容
{context}

## 用户问题
{question}

## 回答要求
1. 只根据提供的知识库内容回答，不要编造信息
2. 如果知识库中没有相关内容，请明确告知用户
3. 回答要专业、准确、简洁
4. 如果需要，可以结合多个检索结果综合回答

回答：
"""
)
```

#### 流式回答实现

```python
def rag_stream(question: str) -> Iterator[str]:
    # 1. 检索相关文档
    docs = retrieve_documents(question=question, k=4)
    
    # 2. 构建上下文
    context = format_retrieved_context(docs)
    
    # 3. 生成完整回答
    prompt = f"基于以下知识库内容回答问题：\n\n{context}\n\n问题：{question}\n\n回答："
    
    # 4. 按句子流式输出
    full_answer = ""
    for chunk in llm.stream(prompt):
        full_answer += str(chunk)
    
    # 按15字符或标点符号分块输出
    buffer = ""
    for char in full_answer:
        buffer += char
        if len(buffer) >= 15 or char in "。！？\n":
            yield buffer
            buffer = ""
            time.sleep(0.02)  # 添加延迟让前端有时间处理
```

## 知识库内容

### 产品规则知识库

包含基金销售的核心规则：
- **产品分类**：股票型、债券型、混合型、货币型基金的特点和风险
- **费率结构**：认购费、赎回费的分段收费标准
- **交易规则**：交易时间、到账时间、分红方式
- **合规要求**：客户适当性管理、双录要求、禁止行为
- **定投规则**：定投频率、优势、适合人群

### 金融知识知识库

涵盖全面的金融基础知识：
- **股票知识**：A股、B股、主板、创业板、科创板等概念
- **基金知识**：各类基金的特点、费用、选择要点
- **债券知识**：债券类型、要素、风险特征
- **货币市场**：货币市场工具、利率指标
- **投资指导**：资产配置原则、不同投资者适合的产品

## 环境配置

RAG模块支持通过环境变量进行灵活配置，所有配置项都可在 `.env` 文件中设置：

### 基础配置
```bash
# 模型配置
LLM_MODEL=qwen-turbo                    # 大语言模型
EMBEDDING_MODEL=text-embedding-v1       # 嵌入模型

# 路径配置
RAG_KNOWLEDGE_PATH=./src/rag/knowledge  # 知识库路径
RAG_PERSIST_DIR=./data/vectorstore      # 向量存储持久化目录
```

### RAG参数配置
```bash
# 检索配置
RAG_RETRIEVER_K=4                       # 检索文档数量
RAG_VECTOR_STORE=chroma                 # 向量存储类型 (chroma/faiss)

# 文本处理配置
RAG_CHUNK_SIZE=500                      # 文本分块大小
RAG_CHUNK_OVERLAP=50                    # 文本分块重叠大小
RAG_SEPARATORS=\n\n|\n|。|.|；|;|，|,| |  # 文本分隔符（用|分隔）

# 流式输出配置
RAG_STREAM_CHUNK_SIZE=15                # 流式输出块大小
RAG_STREAM_DELAY=0.02                   # 流式输出延迟(秒)
```</search>
</search_replace>

### 配置优先级
1. 函数参数（最高优先级）
2. 环境变量
3. 默认值（最低优先级）

### 分隔符配置说明
`RAG_SEPARATORS` 用于配置文本分块时的分隔符，支持：
- **转义字符**：`\n`（换行）、`\t`（制表符）
- **中文标点**：`。`（句号）、`，`（逗号）、`；`（分号）
- **英文标点**：`.`（句号）、`,`（逗号）、`;`（分号）
- **空格字符**：空格、空字符串（字符级分割）

**配置示例**：
```bash
# 标准中文配置（推荐）
RAG_SEPARATORS=\n\n|\n|。|.|；|;|，|,| |

# 简化配置（只按句子和段落分割）
RAG_SEPARATORS=\n\n|\n|。|.

# 英文为主的配置
RAG_SEPARATORS=\n\n|\n|.|;|,| |

# 严格的段落分割
RAG_SEPARATORS=\n\n
```

**分隔符优先级**：按配置顺序从高到低，空字符串`''`为最后的字符级分割。</search>
</search_replace>

## 使用示例

### 基本查询
```python
from src.rag.chain import rag_query

# 使用默认配置
result = rag_query("股票型基金和债券型基金有什么区别？")
print(result["answer"])

# 自定义配置
result = rag_query(
    "基金定投有什么优势？",
    knowledge_path="./custom/knowledge",
    k=8
)
```

### 流式查询
```python
from src.rag.chain import rag_stream

# 使用环境变量配置
for chunk in rag_stream("基金定投有什么优势？"):
    print(chunk, end='', flush=True)

# 自定义流式参数
os.environ["RAG_STREAM_CHUNK_SIZE"] = "20"
os.environ["RAG_STREAM_DELAY"] = "0.01"
```

### 配置测试
```bash
# 测试配置加载
python test_rag_config.py

# 基础功能测试
python test_rag.py
```</search>
</search_replace>

## 性能优化

### 缓存机制
- 向量存储单例模式，避免重复加载
- 支持强制重建向量库

### 检索优化
- 可调节检索数量（k值）
- 支持MMR检索增强多样性
- 带分数的相似度检索

### 中文优化
- 专门的中文文本分块器
- 中文标点符号优先处理
- 金融术语关键词库

## 错误处理

### 异常情况
- **知识库不存在**：返回友好提示
- **向量存储失败**：返回错误信息
- **检索无结果**：明确告知用户
- **LLM调用失败**：异常捕获和降级处理

### 容错机制
- 嵌入失败时返回零向量
- 文档加载失败时跳过继续处理
- 检索为空时给出默认回复

## 扩展性

### 支持的扩展
- **新文档格式**：可扩展支持PDF、Word等格式
- **新向量数据库**：支持接入Pinecone、Weaviate等
- **新嵌入模型**：支持OpenAI、HuggingFace等嵌入
- **多语言支持**：可扩展英文、日文等其他语言

### 配置参数
- 检索数量可调
- 文本分块大小可调
- 向量存储类型可选
- 嵌入模型可配置

## 最佳实践

### 知识库维护
1. 定期更新金融知识和产品规则
2. 保持文档格式一致性
3. 添加新的金融术语关键词
4. 根据用户反馈优化内容

### 性能调优
1. 根据硬件资源调整分块大小
2. 优化检索数量平衡准确性和速度
3. 使用合适的向量数据库
4. 监控检索质量和响应时间

### 用户体验
1. 提供清晰的回答来源引用
2. 对无结果情况给出建议
3. 支持流式输出提升响应感
4. 结合SQL查询提供更全面服务

## 总结

RAG模块通过结合知识库检索和生成式AI，为基金销售场景提供了专业、准确的问答能力。模块设计考虑了中文金融文本特点，支持流式输出，具有良好的扩展性和容错机制。通过持续优化知识库和算法参数，可以不断提升问答质量和用户体验。