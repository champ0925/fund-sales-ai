"""向量存储 - 支持多种向量数据库"""

import os
from typing import List, Optional
from langchain_core.documents import Document
from langchain_community.vectorstores import Chroma, FAISS
from langchain_core.embeddings import Embeddings


class DashscopeEmbeddings(Embeddings):
    """通义千问嵌入模型（自定义实现）"""

    def __init__(self, model: str = "text-embedding-v1", dashscope_api_key: str = None):
        self.model = model
        self.api_key = dashscope_api_key or os.getenv("DASHSCOPE_API_KEY")

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """嵌入文档列表"""
        import dashscope
        dashscope.api_key = self.api_key

        from dashscope import TextEmbedding
        embeddings = []

        for text in texts:
            response = TextEmbedding.call(
                model=self.model,
                input=text
            )
            if response.status_code == 200:
                embedding = response.output['embeddings'][0]['embedding']
                embeddings.append(embedding)
            else:
                embeddings.append([0.0] * 1536)  # fallback

        return embeddings

    def embed_query(self, text: str) -> List[float]:
        """嵌入单个查询"""
        return self.embed_documents([text])[0]


class VectorStoreManager:
    """向量存储管理器"""

    # 支持的向量存储类型
    CHROMA = "chroma"
    FAISS = "faiss"

    @staticmethod
    def create_chroma(
        documents: List[Document],
        collection_name: str = "fund_sales",
        persist_directory: Optional[str] = None,
        embedding_function=None
    ) -> Chroma:
        """创建 Chroma 向量存储

        Args:
            documents: 文档列表
            collection_name: 集合名称
            persist_directory: 持久化目录
            embedding_function: 嵌入函数

        Returns:
            Chroma 向量存储
        """
        if embedding_function is None:
            embedding_function = VectorStoreManager.get_default_embedding()

        # 总是创建新的向量库
        return Chroma.from_documents(
            documents=documents,
            embedding=embedding_function,
            collection_name=collection_name,
            persist_directory=persist_directory,
        )

    @staticmethod
    def create_faiss(
        documents: List[Document],
        embedding_function=None
    ) -> FAISS:
        """创建 FAISS 向量存储

        Args:
            documents: 文档列表
            embedding_function: 嵌入函数

        Returns:
            FAISS 向量存储
        """
        if embedding_function is None:
            embedding_function = VectorStoreManager.get_default_embedding()

        return FAISS.from_documents(
            documents=documents,
            embedding=embedding_function,
        )

    @staticmethod
    def get_default_embedding():
        """获取默认嵌入函数（使用通义千问）"""
        embedding_model = os.getenv("EMBEDDING_MODEL", "text-embedding-v1")
        return DashscopeEmbeddings(
            model=embedding_model,
            dashscope_api_key=os.getenv("DASHSCOPE_API_KEY"),
        )

    @staticmethod
    def load_vector_store(
        store_type: str,
        persist_directory: str,
        embedding_function=None
    ):
        """加载已存在的向量存储

        Args:
            store_type: 存储类型 (chroma/faiss)
            persist_directory: 持久化目录
            embedding_function: 嵌入函数

        Returns:
            向量存储对象
        """
        if embedding_function is None:
            embedding_function = VectorStoreManager.get_default_embedding()

        if store_type == VectorStoreManager.CHROMA:
            return Chroma(
                persist_directory=persist_directory,
                embedding_function=embedding_function,
            )
        elif store_type == VectorStoreManager.FAISS:
            return FAISS.load_local(
                persist_directory,
                embedding_function,
                allow_dangerous_deserialization=True,
            )
        else:
            raise ValueError(f"不支持的向量存储类型: {store_type}")


# 全局向量存储实例（单例）
_vector_store = None
_persist_dir = None


def get_vector_store(
    knowledge_path: str = None,
    persist_directory: str = None,
    force_rebuild: bool = False
):
    """获取向量存储（带缓存）

    Args:
        knowledge_path: 知识库路径
        persist_directory: 持久化目录
        force_rebuild: 是否强制重建

    Returns:
        向量存储对象
    """
    global _vector_store, _persist_dir

    # 从环境变量获取配置
    if persist_directory is None:
        persist_directory = os.getenv("RAG_PERSIST_DIR", "./data/vectorstore")
    
    vector_store_type = os.getenv("RAG_VECTOR_STORE", "chroma")

    # 检查是否已加载
    if _vector_store is not None and not force_rebuild:
        if _persist_dir == persist_directory:
            return _vector_store

    # 导入必要的模块
    from src.rag.document_loader import load_knowledge_directory, get_knowledge_path
    from src.rag.text_splitter import get_default_splitter

    # 获取知识库路径（默认使用 src/rag/knowledge）
    if knowledge_path is None:
        knowledge_path = get_knowledge_path()

    # 加载文档
    if os.path.exists(knowledge_path):
        documents = load_knowledge_directory(knowledge_path)

        if not documents:
            print("⚠️ 知识库目录中没有 txt 文件")
            _vector_store = None
            return None

        # 分割文档
        splitter = get_default_splitter()
        split_docs = splitter.split_documents(documents)

        # 确保目录存在
        os.makedirs(persist_directory, exist_ok=True)

        # 根据配置创建相应类型的向量存储
        if vector_store_type == "faiss":
            _vector_store = VectorStoreManager.create_faiss(
                documents=split_docs,
            )
        else:  # 默认使用chroma
            _vector_store = VectorStoreManager.create_chroma(
                documents=split_docs,
                persist_directory=persist_directory,
            )
        _persist_dir = persist_directory
        print(f"✅ 知识库已加载，共 {len(split_docs)} 个文档块，使用 {vector_store_type} 向量存储")
    else:
        print(f"⚠️ 知识库目录不存在: {knowledge_path}")
        _vector_store = None

    return _vector_store


def rebuild_vector_store(
    knowledge_path: str = None,
    persist_directory: str = "./data/vectorstore"
):
    """重建向量存储"""
    return get_vector_store(
        knowledge_path=knowledge_path,
        persist_directory=persist_directory,
        force_rebuild=True,
    )